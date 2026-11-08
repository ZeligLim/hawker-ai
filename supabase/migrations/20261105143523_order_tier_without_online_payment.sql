ALTER TABLE public.orders
  ALTER COLUMN payment_status SET DEFAULT 'PENDING';

ALTER TABLE public.merchant_orders
  ALTER COLUMN payment_status SET DEFAULT 'PENDING';

ALTER TABLE public.merchant_orders
  DROP CONSTRAINT IF EXISTS merchant_orders_payment_status_check;

ALTER TABLE public.merchant_orders
  ADD CONSTRAINT merchant_orders_payment_status_check
  CHECK (payment_status IN ('PENDING', 'PROCESSING', 'PAID', 'PARTIALLY_REFUNDED', 'FULLY_REFUNDED', 'FAILED', 'CANCELLED'));

CREATE OR REPLACE FUNCTION public.create_order_with_items(
  p_table_session_id UUID,
  p_subtotal NUMERIC,
  p_service_fee NUMERIC,
  p_total NUMERIC,
  p_items JSONB,
  p_subtotal_amount NUMERIC DEFAULT 0,
  p_platform_fee_amount NUMERIC DEFAULT 0,
  p_total_amount NUMERIC DEFAULT 0,
  p_merchant_payout_amount NUMERIC DEFAULT 0
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_current_user_id UUID;
  v_merchant_order_id UUID;
BEGIN
  v_current_user_id := auth.uid();

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'At least one order item is required';
  END IF;

  IF p_subtotal < 0 OR p_service_fee < 0 OR p_total < 0 THEN
    RAISE EXCEPTION 'Order totals cannot be negative';
  END IF;

  IF p_table_session_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.table_sessions
    WHERE id = p_table_session_id
      AND (customer_id = v_current_user_id OR customer_id IS NULL)
      AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Invalid or inactive table session';
  END IF;

  INSERT INTO public.orders (
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
    payment_status,
    paid_at
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
    'PENDING',
    NULL
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    SELECT id INTO v_merchant_order_id
    FROM public.merchant_orders
    WHERE order_id = v_order_id
      AND food_outlet_id = (v_item->>'stallId')::UUID;

    IF NOT FOUND THEN
      INSERT INTO public.merchant_orders (
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
        0,
        0,
        'PENDING'
      )
      RETURNING id INTO v_merchant_order_id;
    END IF;

    INSERT INTO public.order_items (
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

    UPDATE public.merchant_orders
    SET subtotal = subtotal + ((v_item->>'price')::NUMERIC * (v_item->>'quantity')::INTEGER)
    WHERE id = v_merchant_order_id;
  END LOOP;

  RETURN v_order_id;
END;
$$;