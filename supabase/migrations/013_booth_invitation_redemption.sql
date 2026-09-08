-- Migration 013: Booth Invitation Redemption RPC & RLS Policies
-- Solves: "This invitation is invalid or expired." when claiming booth invitations without service role key

-- 1. Allow authenticated users to view unexpired, unused booth invitations or invitations sent to their email
DROP POLICY IF EXISTS "Shop members can view booth invitations for their restaurants" ON booth_invitations;
CREATE POLICY "Shop members and invitees can view booth invitations"
  ON booth_invitations FOR SELECT
  USING (
    -- Restaurant owners / managers
    EXISTS (
      SELECT 1
      FROM food_outlets fo
      JOIN restaurant_memberships rm
        ON rm.restaurant_id = fo.restaurant_id
      WHERE fo.id = booth_invitations.food_outlet_id
        AND rm.user_id = auth.uid()
        AND rm.role IN ('owner', 'manager')
    )
    -- Existing booth members
    OR EXISTS (
      SELECT 1
      FROM merchant_memberships mm
      WHERE mm.user_id = auth.uid()
        AND mm.food_outlet_id = booth_invitations.food_outlet_id
    )
    -- Invited email matches current user email
    OR (
      invited_email IS NOT NULL
      AND LOWER(invited_email) = LOWER(auth.jwt() ->> 'email')
    )
    -- Active unexpired token lookup
    OR (
      used_at IS NULL
      AND expires_at > NOW()
    )
  );

-- 2. Allow authenticated users to insert their own merchant membership when claiming a booth
DROP POLICY IF EXISTS "Authenticated users can join merchant membership" ON merchant_memberships;
CREATE POLICY "Authenticated users can join merchant membership"
  ON merchant_memberships FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
  );

-- 3. Allow updating booth invitation when marking it as used
DROP POLICY IF EXISTS "Invitees can mark booth invitations as used" ON booth_invitations;
CREATE POLICY "Invitees can mark booth invitations as used"
  ON booth_invitations FOR UPDATE
  TO authenticated
  USING (
    used_at IS NULL
    OR used_by = auth.uid()
    OR created_by = auth.uid()
  )
  WITH CHECK (
    used_by = auth.uid()
    OR created_by = auth.uid()
  );

-- 4. Atomic Booth Claim RPC Function (SECURITY DEFINER)
-- Runs with database owner privileges so token redemption never fails due to client-side RLS constraints
CREATE OR REPLACE FUNCTION claim_booth_invitation(
  p_token_hash TEXT,
  p_stall_name TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_user_email TEXT;
  v_invitation RECORD;
  v_existing_membership RECORD;
  v_outlet RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required.');
  END IF;

  -- Get current user email from JWT or auth.users
  v_user_email := LOWER(TRIM(COALESCE(
    auth.jwt() ->> 'email',
    (SELECT email FROM auth.users WHERE id = v_user_id)
  )));

  -- Lookup invitation record by token hash
  SELECT * INTO v_invitation
  FROM booth_invitations
  WHERE token_hash = p_token_hash;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'This invitation is invalid or expired.');
  END IF;

  IF v_invitation.expires_at < NOW() THEN
    RETURN jsonb_build_object('success', false, 'error', 'This invitation has expired.');
  END IF;

  IF v_invitation.used_at IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'This invitation has already been used.');
  END IF;

  -- Security check: If invited_email is defined, only that exact email may claim this stall
  IF v_invitation.invited_email IS NOT NULL AND TRIM(v_invitation.invited_email) <> '' THEN
    IF v_user_email IS NULL OR LOWER(TRIM(v_invitation.invited_email)) <> v_user_email THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'This setup link was sent specifically to ' || v_invitation.invited_email || '. You are signed in as ' || COALESCE(v_user_email, 'unknown') || '. Only the invited email can edit this stall. Please sign in with that email.'
      );
    END IF;
  END IF;

  -- Check if already an active member of this booth
  SELECT * INTO v_existing_membership
  FROM merchant_memberships
  WHERE user_id = v_user_id AND food_outlet_id = v_invitation.food_outlet_id;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'success', true,
      'status', 'already-member',
      'boothId', v_invitation.food_outlet_id
    );
  END IF;

  -- Update stall / brand name if provided
  IF p_stall_name IS NOT NULL AND TRIM(p_stall_name) <> '' THEN
    UPDATE food_outlets
    SET name = TRIM(p_stall_name)
    WHERE id = v_invitation.food_outlet_id;
  END IF;

  -- Insert merchant membership for this booth
  INSERT INTO merchant_memberships (user_id, food_outlet_id, role, email)
  VALUES (v_user_id, v_invitation.food_outlet_id, 'owner', v_user_email)
  ON CONFLICT (user_id, food_outlet_id) DO UPDATE SET email = EXCLUDED.email;

  -- Mark invitation as redeemed
  UPDATE booth_invitations
  SET used_at = NOW(), used_by = v_user_id
  WHERE id = v_invitation.id;

  RETURN jsonb_build_object(
    'success', true,
    'status', 'joined',
    'boothId', v_invitation.food_outlet_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION claim_booth_invitation TO authenticated;

-- 5. Safe Inspection RPC Function (SECURITY DEFINER)
-- Allows previewing booth/venue details for a token before claiming
CREATE OR REPLACE FUNCTION get_booth_invitation_details(p_token_hash TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invitation RECORD;
  v_outlet RECORD;
  v_restaurant RECORD;
BEGIN
  SELECT * INTO v_invitation
  FROM booth_invitations
  WHERE token_hash = p_token_hash;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'This invitation is invalid or expired.');
  END IF;

  IF v_invitation.expires_at < NOW() THEN
    RETURN jsonb_build_object('valid', false, 'error', 'This invitation has expired.');
  END IF;

  IF v_invitation.used_at IS NOT NULL THEN
    RETURN jsonb_build_object('valid', false, 'error', 'This invitation has already been used.');
  END IF;

  SELECT * INTO v_outlet FROM food_outlets WHERE id = v_invitation.food_outlet_id;
  SELECT * INTO v_restaurant FROM restaurants WHERE id = v_outlet.restaurant_id;

  RETURN jsonb_build_object(
    'valid', true,
    'id', v_invitation.id,
    'boothId', v_invitation.food_outlet_id,
    'boothName', v_outlet.name,
    'venueName', v_restaurant.name,
    'invitedEmail', v_invitation.invited_email,
    'expiresAt', v_invitation.expires_at
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_booth_invitation_details TO anon, authenticated;
