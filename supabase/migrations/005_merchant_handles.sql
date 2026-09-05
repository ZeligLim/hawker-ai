CREATE TABLE IF NOT EXISTS merchant_handles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_outlet_id UUID NOT NULL UNIQUE REFERENCES food_outlets(id) ON DELETE CASCADE,
  handle TEXT NOT NULL UNIQUE CHECK (handle ~ '^@[a-z0-9_]+$'),
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_merchant_handles_handle ON merchant_handles(handle);

ALTER TABLE merchant_handles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view merchant handles"
  ON merchant_handles FOR SELECT
  USING (true);

CREATE POLICY "Members can update their merchant handle"
  ON merchant_handles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM merchant_memberships
      WHERE merchant_memberships.user_id = auth.uid()
        AND merchant_memberships.food_outlet_id = merchant_handles.food_outlet_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM merchant_memberships
      WHERE merchant_memberships.user_id = auth.uid()
        AND merchant_memberships.food_outlet_id = merchant_handles.food_outlet_id
    )
  );
