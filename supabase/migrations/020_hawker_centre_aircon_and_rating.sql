-- Migration 020: Add aircon indicator and rating to restaurants table
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS has_aircon BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) NOT NULL DEFAULT 4.5;

-- Update existing sample restaurants with realistic aircon and rating data
UPDATE restaurants
SET has_aircon = FALSE, rating = 4.7
WHERE slug = '888-restoran';

UPDATE restaurants
SET has_aircon = TRUE, rating = 4.9
WHERE slug = 'lim-s-foodcourt';

CREATE INDEX IF NOT EXISTS idx_restaurants_has_aircon ON restaurants(has_aircon);
CREATE INDEX IF NOT EXISTS idx_restaurants_rating ON restaurants(rating);
