-- Migration 019: Operating Hours Schedules and Dual-Layer Booth Active Status
-- 1. Adds JSONB schedule column to restaurants and food_outlets for automated opening/closing hours.
-- 2. Adds is_active column to food_outlets to give Venue Owners master override control (Active vs Inactive).
-- 3. Enables indexing on food_outlets(is_active) for high performance filtering.

-- 1. Restaurants: Add schedule column
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT NULL;

-- 2. Food Outlets: Add schedule and is_active columns
ALTER TABLE food_outlets
  ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT NULL;

ALTER TABLE food_outlets
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_food_outlets_is_active ON food_outlets(is_active);
