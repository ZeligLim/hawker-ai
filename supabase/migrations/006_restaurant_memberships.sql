CREATE TABLE IF NOT EXISTS restaurant_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'manager', 'staff')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, restaurant_id)
);

CREATE INDEX IF NOT EXISTS idx_restaurant_memberships_user ON restaurant_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_memberships_restaurant ON restaurant_memberships(restaurant_id);

ALTER TABLE restaurant_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their restaurant memberships"
  ON restaurant_memberships FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Members can create their restaurant memberships"
  ON restaurant_memberships FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Members can update their restaurant memberships"
  ON restaurant_memberships FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
