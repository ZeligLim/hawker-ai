-- Migration 015: Shop Active Status & Booth Open/Closed Status
-- Allows shop owners to toggle shop active/inactive, and booth owners to set themselves open/closed.

-- 1. Restaurants: Add is_active column with default true
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_restaurants_is_active ON restaurants(is_active);

-- 2. Food Outlets: Add is_open column with default true
ALTER TABLE food_outlets
  ADD COLUMN IF NOT EXISTS is_open BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_food_outlets_is_open ON food_outlets(is_open);

-- 3. Food Outlets: Allow merchant staff/owners to update their own food outlet (e.g. is_open)
DROP POLICY IF EXISTS "Merchants can update their own food outlet" ON food_outlets;
CREATE POLICY "Merchants can update their own food outlet"
  ON food_outlets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM merchant_memberships mm
      WHERE mm.food_outlet_id = food_outlets.id
        AND mm.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM merchant_memberships mm
      WHERE mm.food_outlet_id = food_outlets.id
        AND mm.user_id = auth.uid()
    )
  );
