-- Simplified Order Management

-- 1. Drop existing constraints
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE merchant_orders DROP CONSTRAINT IF EXISTS merchant_orders_status_check;

-- 2. Add previous_status column to merchant_orders for cancellation workflows
ALTER TABLE merchant_orders ADD COLUMN IF NOT EXISTS previous_status TEXT;

-- 3. Update existing statuses to the new simplified flow
UPDATE orders SET status = 'PENDING' WHERE status IN ('pending_payment', 'paid');
UPDATE orders SET status = 'PREPARING' WHERE status IN ('in_progress', 'partially_ready');
UPDATE orders SET status = 'READY' WHERE status = 'ready';
UPDATE orders SET status = 'COMPLETED' WHERE status = 'served';
UPDATE orders SET status = 'CANCELLED' WHERE status = 'cancelled';

UPDATE merchant_orders SET status = 'PENDING' WHERE status IN ('waiting', 'accepted');
UPDATE merchant_orders SET status = 'PREPARING' WHERE status = 'preparing';
UPDATE merchant_orders SET status = 'READY' WHERE status = 'ready';
UPDATE merchant_orders SET status = 'COMPLETED' WHERE status = 'served';
UPDATE merchant_orders SET status = 'CANCELLED' WHERE status = 'cancelled';

-- 4. Add new constraints
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLATION_REQUESTED', 'CANCELLED'));

ALTER TABLE merchant_orders ADD CONSTRAINT merchant_orders_status_check 
  CHECK (status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLATION_REQUESTED', 'CANCELLED'));

-- 5. Set default status
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'PENDING';
ALTER TABLE merchant_orders ALTER COLUMN status SET DEFAULT 'PENDING';

-- 6. Simplify the RPC for Order Creation (Removing payment references)
CREATE OR REPLACE FUNCTION create_order_with_items(
  p_table_session_id UUID,
  p_subtotal NUMERIC,
  p_service_fee NUMERIC,
  p_total NUMERIC,
  p_items JSONB,
  p_subtotal_amount NUMERIC DEFAULT 0,
  p_platform_fee_amount NUMERIC DEFAULT 0,
  p_total_amount NUMERIC DEFAULT 0,
  p_merchant_payout_amount NUMERIC DEFAULT 0
) RETURNS UUID AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_current_user_id UUID;
  v_merchant_order_id UUID;
BEGIN
  v_current_user_id := auth.uid();

  -- Verify table session if provided
  IF p_table_session_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM table_sessions 
      WHERE id = p_table_session_id AND (customer_id = v_current_user_id OR customer_id IS NULL) AND status = 'active'
    ) THEN
      RAISE EXCEPTION 'Invalid or inactive table session';
    END IF;
  END IF;

  -- Create main order with PENDING status
  INSERT INTO orders (
    customer_id, 
    table_session_id, 
    status, 
    subtotal, 
    service_fee, 
    total,
    subtotal_amount,
    platform_fee_amount,
    total_amount,
    merchant_payout_amount,
    payment_status
  )
  VALUES (
    v_current_user_id, 
    p_table_session_id, 
    'PENDING', 
    p_subtotal, 
    p_service_fee, 
    p_total,
    p_subtotal_amount,
    p_platform_fee_amount,
    p_total_amount,
    p_merchant_payout_amount,
    'PAID' -- Defaulting to PAID since V1 has no payments
  )
  RETURNING id INTO v_order_id;

  -- Process items and create merchant_orders implicitly via unique constraint logic
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Ensure merchant_order exists for this stall
    SELECT id INTO v_merchant_order_id
    FROM merchant_orders
    WHERE order_id = v_order_id AND food_outlet_id = (v_item->>'stallId')::UUID;

    IF NOT FOUND THEN
      INSERT INTO merchant_orders (
        order_id, 
        food_outlet_id, 
        status, 
        subtotal,
        merchant_payout_amount,
        payment_status
      )
      VALUES (
        v_order_id, 
        (v_item->>'stallId')::UUID, 
        'PENDING', 
        0, -- updated below or via service
        0,
        'PAID'
      )
      RETURNING id INTO v_merchant_order_id;
    END IF;

    -- Insert order_item
    INSERT INTO order_items (
      order_id,
      merchant_order_id,
      dish_id,
      dish_name,
      unit_price,
      quantity,
      customizations,
      notes
    )
    VALUES (
      v_order_id,
      v_merchant_order_id,
      (v_item->>'dishId')::UUID,
      v_item->>'name',
      (v_item->>'price')::NUMERIC,
      (v_item->>'quantity')::INTEGER,
      COALESCE((v_item->>'customizations')::JSONB, '[]'::JSONB),
      COALESCE(v_item->>'notes', '')
    );
    
    -- Accumulate subtotal dynamically based on items
    UPDATE merchant_orders 
    SET subtotal = subtotal + ((v_item->>'price')::NUMERIC * (v_item->>'quantity')::INTEGER)
    WHERE id = v_merchant_order_id;
    
  END LOOP;

  RETURN v_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
