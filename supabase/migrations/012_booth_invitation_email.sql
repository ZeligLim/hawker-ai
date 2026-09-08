-- Migration 012: Add email to booth invitations and merchant memberships with owner access control

-- 1. Add invited_email column to booth_invitations
ALTER TABLE booth_invitations ADD COLUMN IF NOT EXISTS invited_email TEXT;
CREATE INDEX IF NOT EXISTS idx_booth_invitations_email ON booth_invitations(invited_email);

-- 2. Add email column to merchant_memberships
ALTER TABLE merchant_memberships ADD COLUMN IF NOT EXISTS email TEXT;
CREATE INDEX IF NOT EXISTS idx_merchant_memberships_email ON merchant_memberships(email);

-- 3. Backfill merchant_memberships.email from auth.users if available
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    UPDATE merchant_memberships mm
    SET email = u.email
    FROM auth.users u
    WHERE mm.user_id = u.id AND (mm.email IS NULL OR mm.email = '');
  END IF;
END $$;

-- 4. Allow restaurant owners to view all merchant memberships in their outlets
DROP POLICY IF EXISTS "Restaurant owners can view memberships in their outlets" ON merchant_memberships;
CREATE POLICY "Restaurant owners can view memberships in their outlets"
  ON merchant_memberships FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM food_outlets fo
      JOIN restaurant_memberships rm ON rm.restaurant_id = fo.restaurant_id
      WHERE fo.id = merchant_memberships.food_outlet_id
        AND rm.user_id = auth.uid()
        AND rm.role IN ('owner', 'manager')
    )
  );

-- 5. Allow restaurant owners to delete/revoke stall members in their outlets
DROP POLICY IF EXISTS "Restaurant owners can delete stall members from their outlets" ON merchant_memberships;
CREATE POLICY "Restaurant owners can delete stall members from their outlets"
  ON merchant_memberships FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM food_outlets fo
      JOIN restaurant_memberships rm ON rm.restaurant_id = fo.restaurant_id
      WHERE fo.id = merchant_memberships.food_outlet_id
        AND rm.user_id = auth.uid()
        AND rm.role IN ('owner', 'manager')
    )
  );

-- 6. Allow restaurant owners to delete/revoke booth invitations in their outlets
DROP POLICY IF EXISTS "Restaurant owners can delete booth invitations" ON booth_invitations;
CREATE POLICY "Restaurant owners can delete booth invitations"
  ON booth_invitations FOR DELETE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM food_outlets fo
      JOIN restaurant_memberships rm ON rm.restaurant_id = fo.restaurant_id
      WHERE fo.id = booth_invitations.food_outlet_id
        AND rm.user_id = auth.uid()
        AND rm.role IN ('owner', 'manager')
    )
  );
