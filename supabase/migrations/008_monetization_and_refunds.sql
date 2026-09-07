-- Migration 008: Platform Monetization, Dynamic Customer Fee, and Out-of-Stock Refund System

-- 1. Extend restaurants and food_outlets with fee configuration
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS fee_payer VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER' CHECK (fee_payer IN ('CUSTOMER', 'MERCHANT')),
  ADD COLUMN IF NOT EXISTS platform_fee_fixed NUMERIC(10,2) NOT NULL DEFAULT 0.50,
  ADD COLUMN IF NOT EXISTS platform_fee_percent NUMERIC(5,4) NOT NULL DEFAULT 0.0000;

ALTER TABLE food_outlets
  ADD COLUMN IF NOT EXISTS fee_payer VARCHAR(20) DEFAULT 'CUSTOMER' CHECK (fee_payer IN ('CUSTOMER', 'MERCHANT')),
  ADD COLUMN IF NOT EXISTS platform_fee_fixed NUMERIC(10,2) DEFAULT 0.50,
  ADD COLUMN IF NOT EXISTS platform_fee_percent NUMERIC(5,4) DEFAULT 0.0000;

-- 2. Extend orders with monetization & refund fields
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS subtotal_amount NUMERIC(10, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS platform_fee_amount NUMERIC(10, 2) DEFAULT 0.50,
  ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS merchant_payout_amount NUMERIC(10, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) NOT NULL DEFAULT 'PAID'
    CHECK (payment_status IN ('PAID', 'PARTIALLY_REFUNDED', 'FULLY_REFUNDED', 'FAILED')),
  ADD COLUMN IF NOT EXISTS refund_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (refund_amount >= 0),
  ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255);

-- Backfill existing orders with legacy fields where needed
UPDATE orders
SET
  subtotal_amount = COALESCE(subtotal_amount, subtotal, 0),
  platform_fee_amount = COALESCE(platform_fee_amount, service_fee, 0.50),
  total_amount = COALESCE(total_amount, total, 0),
  merchant_payout_amount = COALESCE(merchant_payout_amount, subtotal, 0),
  payment_intent_id = COALESCE(payment_intent_id, payment_reference, CONCAT('pi_', id::text))
WHERE subtotal_amount IS NULL OR subtotal_amount = 0;

-- 3. Extend merchant_orders and order_items for granular stall-level refunds
ALTER TABLE merchant_orders
  ADD COLUMN IF NOT EXISTS merchant_payout_amount NUMERIC(10, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS refund_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (refund_amount >= 0),
  ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) NOT NULL DEFAULT 'PAID'
    CHECK (payment_status IN ('PAID', 'PARTIALLY_REFUNDED', 'FULLY_REFUNDED', 'FAILED'));

UPDATE merchant_orders
SET
  merchant_payout_amount = COALESCE(merchant_payout_amount, subtotal, 0)
WHERE merchant_payout_amount IS NULL OR merchant_payout_amount = 0;

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS is_refunded BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS refund_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (refund_amount >= 0),
  ADD COLUMN IF NOT EXISTS refund_reason TEXT NOT NULL DEFAULT '';

-- 4. Overloaded or updated create_order_with_items RPC
CREATE OR REPLACE FUNCTION create_order_with_items(
  p_table_session_id UUID,
  p_subtotal NUMERIC,
  p_service_fee NUMERIC,
  p_total NUMERIC,
  p_payment_reference TEXT,
  p_items JSONB,
  p_subtotal_amount NUMERIC DEFAULT NULL,
  p_platform_fee_amount NUMERIC DEFAULT NULL,
  p_total_amount NUMERIC DEFAULT NULL,
  p_merchant_payout_amount NUMERIC DEFAULT NULL,
  p_payment_status VARCHAR DEFAULT 'PAID',
  p_payment_intent_id VARCHAR DEFAULT NULL
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
  v_subtotal NUMERIC;
  v_fee NUMERIC;
  v_total NUMERIC;
  v_merchant_payout NUMERIC;
  v_intent TEXT;
  v_status VARCHAR;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'At least one order item is required';
  END IF;

  v_subtotal := COALESCE(p_subtotal_amount, p_subtotal, 0);
  v_fee := COALESCE(p_platform_fee_amount, p_service_fee, 0);
  v_total := COALESCE(p_total_amount, p_total, 0);
  v_intent := COALESCE(p_payment_intent_id, p_payment_reference, CONCAT('pi_', gen_random_uuid()::text));
  v_status := COALESCE(p_payment_status, 'PAID');
  v_merchant_payout := COALESCE(p_merchant_payout_amount, v_subtotal);

  IF v_subtotal < 0 OR v_fee < 0 OR v_total < 0 THEN
    RAISE EXCEPTION 'Order totals cannot be negative';
  END IF;

  IF p_table_session_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM table_sessions
    WHERE id = p_table_session_id AND customer_id = current_user_id AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Invalid table session';
  END IF;

  INSERT INTO orders (
    customer_id,
    table_session_id,
    status,
    subtotal,
    service_fee,
    total,
    payment_reference,
    paid_at,
    subtotal_amount,
    platform_fee_amount,
    total_amount,
    merchant_payout_amount,
    payment_status,
    refund_amount,
    payment_intent_id
  )
  VALUES (
    current_user_id,
    p_table_session_id,
    'paid',
    v_subtotal,
    v_fee,
    v_total,
    v_intent,
    NOW(),
    v_subtotal,
    v_fee,
    v_total,
    v_merchant_payout,
    v_status,
    0.00,
    v_intent
  )
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
      INSERT INTO merchant_orders (order_id, food_outlet_id, status, subtotal, merchant_payout_amount, payment_status, refund_amount)
      VALUES (new_order_id, item_stall_id, 'waiting', item_price * item_quantity, item_price * item_quantity, 'PAID', 0.00)
      RETURNING id INTO merchant_order_id;
    ELSE
      UPDATE merchant_orders
      SET
        subtotal = subtotal + item_price * item_quantity,
        merchant_payout_amount = merchant_payout_amount + item_price * item_quantity,
        updated_at = NOW()
      WHERE id = merchant_order_id;
    END IF;

    INSERT INTO order_items (order_id, merchant_order_id, dish_id, dish_name, unit_price, quantity, customizations, notes, is_refunded, refund_amount)
    VALUES (new_order_id, merchant_order_id, item_dish_id, item_name, item_price, item_quantity, item_customizations, item_notes, FALSE, 0.00);
  END LOOP;

  RETURN new_order_id;
END;
$$;

REVOKE ALL ON FUNCTION create_order_with_items(UUID, NUMERIC, NUMERIC, NUMERIC, TEXT, JSONB, NUMERIC, NUMERIC, NUMERIC, NUMERIC, VARCHAR, VARCHAR) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_order_with_items(UUID, NUMERIC, NUMERIC, NUMERIC, TEXT, JSONB, NUMERIC, NUMERIC, NUMERIC, NUMERIC, VARCHAR, VARCHAR) TO authenticated;
