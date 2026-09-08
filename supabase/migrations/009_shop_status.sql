-- Migration 009: Shop and Stall Onboarding Status
-- Adds status column to restaurants and food_outlets to support hawker shop application workflow

ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved'
  CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected', 'suspended'));

ALTER TABLE food_outlets
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved'
  CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected', 'suspended'));

CREATE INDEX IF NOT EXISTS idx_restaurants_status ON restaurants(status);
CREATE INDEX IF NOT EXISTS idx_food_outlets_status ON food_outlets(status);
