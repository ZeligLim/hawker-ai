-- Drop the old constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;

-- Add the new constraint
ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check 
  CHECK (payment_status IN ('PENDING', 'PROCESSING', 'PAID', 'PARTIALLY_REFUNDED', 'FULLY_REFUNDED', 'FAILED', 'CANCELLED'));

-- Add payment_id if not using payment_intent_id
-- We'll just use payment_id since we already added it in 032
