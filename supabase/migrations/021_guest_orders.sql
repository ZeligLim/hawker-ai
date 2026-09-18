-- Allow orders to be created without a signed-in customer (Guest Checkout)
ALTER TABLE orders ALTER COLUMN customer_id DROP NOT NULL;

-- Update RLS for orders to allow guest creation and viewing
DROP POLICY IF EXISTS "Customers can view their orders" ON orders;
CREATE POLICY "Customers can view their orders"
  ON orders FOR SELECT
  USING (customer_id = auth.uid() OR customer_id IS NULL);

DROP POLICY IF EXISTS "Customers can create their orders" ON orders;
CREATE POLICY "Customers can create their orders"
  ON orders FOR INSERT
  WITH CHECK (customer_id = auth.uid() OR customer_id IS NULL);

DROP POLICY IF EXISTS "Customers can view their order merchants" ON merchant_orders;
CREATE POLICY "Customers can view their order merchants"
  ON merchant_orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = merchant_orders.order_id
        AND (orders.customer_id = auth.uid() OR orders.customer_id IS NULL)
    )
  );

DROP POLICY IF EXISTS "Customers can view their order items" ON order_items;
CREATE POLICY "Customers can view their order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (orders.customer_id = auth.uid() OR orders.customer_id IS NULL)
    )
  );

DROP POLICY IF EXISTS "Customers can create their order items" ON order_items;
CREATE POLICY "Customers can create their order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (orders.customer_id = auth.uid() OR orders.customer_id IS NULL)
    )
  );

-- Update RPC to allow guest checkout
CREATE OR REPLACE FUNCTION create_order_with_items(
  p_table_session_id UUID,
  p_subtotal NUMERIC,
  p_service_fee NUMERIC,
  p_total NUMERIC,
  p_payment_reference TEXT,
  p_items JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  new_order_id UUID;
  merchant_order_id UUID;
  item JSONB;
  item_dish_id UUID;
  item_stall_id UUID;
  item_name TEXT;
  item_price NUMERIC;
  item_quantity INTEGER;
  item_customizations JSONB;
  item_notes TEXT;
BEGIN
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'At least one order item is required';
  END IF;

  IF p_subtotal < 0 OR p_service_fee < 0 OR p_total < 0 THEN
    RAISE EXCEPTION 'Order totals cannot be negative';
  END IF;

  IF p_table_session_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM table_sessions
    WHERE id = p_table_session_id AND (customer_id = current_user_id OR customer_id IS NULL) AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Invalid table session';
  END IF;

  INSERT INTO orders (customer_id, table_session_id, status, subtotal, service_fee, total, payment_reference, paid_at)
  VALUES (current_user_id, p_table_session_id, 'paid', p_subtotal, p_service_fee, p_total, p_payment_reference, NOW())
  RETURNING id INTO new_order_id;

  FOR item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    item_dish_id := (item->>'dishId')::UUID;
    item_stall_id := (item->>'stallId')::UUID;
    item_name := item->>'name';
    item_price := (item->>'price')::NUMERIC;
    item_quantity := (item->>'quantity')::INTEGER;
    item_customizations := COALESCE(item->'customizations', '[]'::jsonb);
    item_notes := COALESCE(item->>'notes', '');

    IF item_quantity IS NULL OR item_quantity <= 0 OR item_price IS NULL OR item_price < 0 THEN
      RAISE EXCEPTION 'Invalid order item';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM dishes
      WHERE dishes.id = item_dish_id
        AND dishes.food_outlet_id = item_stall_id
        AND dishes.is_available = TRUE
    ) THEN
      RAISE EXCEPTION 'Dish is unavailable';
    END IF;

    SELECT id INTO merchant_order_id
    FROM merchant_orders
    WHERE order_id = new_order_id AND food_outlet_id = item_stall_id;

    IF merchant_order_id IS NULL THEN
      INSERT INTO merchant_orders (order_id, food_outlet_id, status, subtotal)
      VALUES (new_order_id, item_stall_id, 'waiting', item_price * item_quantity)
      RETURNING id INTO merchant_order_id;
    ELSE
      UPDATE merchant_orders
      SET subtotal = subtotal + item_price * item_quantity, updated_at = NOW()
      WHERE id = merchant_order_id;
    END IF;

    INSERT INTO order_items (order_id, merchant_order_id, dish_id, dish_name, unit_price, quantity, customizations, notes)
    VALUES (new_order_id, merchant_order_id, item_dish_id, item_name, item_price, item_quantity, item_customizations, item_notes);
  END LOOP;

  RETURN new_order_id;
END;
$$;

-- Allow anon to call the RPC
GRANT EXECUTE ON FUNCTION create_order_with_items(UUID, NUMERIC, NUMERIC, NUMERIC, TEXT, JSONB) TO anon;
