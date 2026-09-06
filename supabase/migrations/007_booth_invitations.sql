CREATE TABLE IF NOT EXISTS booth_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_outlet_id UUID NOT NULL REFERENCES food_outlets(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booth_invitations_outlet ON booth_invitations(food_outlet_id);
CREATE INDEX IF NOT EXISTS idx_booth_invitations_hash ON booth_invitations(token_hash);

ALTER TABLE booth_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shop members can view booth invitations for their restaurants"
  ON booth_invitations FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM food_outlets fo
      JOIN restaurant_memberships rm
        ON rm.restaurant_id = fo.restaurant_id
      WHERE fo.id = booth_invitations.food_outlet_id
        AND rm.user_id = auth.uid()
        AND rm.role IN ('owner', 'manager')
    )
    OR EXISTS (
      SELECT 1
      FROM merchant_memberships mm
      WHERE mm.user_id = auth.uid()
        AND mm.food_outlet_id = booth_invitations.food_outlet_id
    )
  );

CREATE POLICY "Shop owners can create booth invitations for their restaurants"
  ON booth_invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM food_outlets fo
      JOIN restaurant_memberships rm
        ON rm.restaurant_id = fo.restaurant_id
      WHERE fo.id = booth_invitations.food_outlet_id
        AND rm.user_id = auth.uid()
        AND rm.role IN ('owner', 'manager')
    )
  );

CREATE POLICY "Shop owners can update or revoke booth invitations"
  ON booth_invitations FOR UPDATE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM food_outlets fo
      JOIN restaurant_memberships rm
        ON rm.restaurant_id = fo.restaurant_id
      WHERE fo.id = booth_invitations.food_outlet_id
        AND rm.user_id = auth.uid()
        AND rm.role IN ('owner', 'manager')
    )
  )
  WITH CHECK (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM food_outlets fo
      JOIN restaurant_memberships rm
        ON rm.restaurant_id = fo.restaurant_id
      WHERE fo.id = booth_invitations.food_outlet_id
        AND rm.user_id = auth.uid()
        AND rm.role IN ('owner', 'manager')
    )
  );
