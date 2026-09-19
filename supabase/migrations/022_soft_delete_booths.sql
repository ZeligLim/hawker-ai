ALTER TABLE food_outlets ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_food_outlets_deleted_at ON food_outlets(deleted_at);
