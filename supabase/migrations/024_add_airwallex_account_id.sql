-- Add Airwallex account ID for stall owners to receive payments
ALTER TABLE food_outlets ADD COLUMN IF NOT EXISTS airwallex_account_id TEXT;
