-- Migration 014: Safe Booth Slot Deletion
-- Allows hawker centre owners and managers to delete booth slots along with cascade cleanup

-- 1. Ensure owners can delete food outlets
DROP POLICY IF EXISTS "Owners can delete food outlets for their restaurants" ON food_outlets;
CREATE POLICY "Owners can delete food outlets for their restaurants"
  ON food_outlets FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_memberships rm
      WHERE rm.restaurant_id = food_outlets.restaurant_id
        AND rm.user_id = auth.uid()
        AND rm.role IN ('owner', 'manager')
    )
  );

-- 2. Stored Procedure: delete_booth_slot (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION delete_booth_slot(p_booth_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  target_restaurant_id UUID;
  caller_role TEXT;
  target_booth_name TEXT;
BEGIN
  -- Authenticate caller
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Authentication required.');
  END IF;

  -- 1. Retrieve target booth details
  SELECT restaurant_id, name INTO target_restaurant_id, target_booth_name
  FROM food_outlets
  WHERE id = p_booth_id;

  IF target_restaurant_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Booth slot not found.');
  END IF;

  -- 2. Verify caller is owner or manager of the venue
  SELECT role INTO caller_role
  FROM restaurant_memberships
  WHERE restaurant_id = target_restaurant_id
    AND user_id = current_user_id;

  IF caller_role IS NULL OR caller_role NOT IN ('owner', 'manager') THEN
    RETURN jsonb_build_object('error', 'Unauthorized: Only venue owners or managers can delete booth slots.');
  END IF;

  -- 3. Cascade cleanup of dependent tables
  -- Delete order items for merchant orders associated with this booth
  DELETE FROM order_items
  WHERE merchant_order_id IN (
    SELECT id FROM merchant_orders WHERE food_outlet_id = p_booth_id
  );

  -- Delete merchant orders
  DELETE FROM merchant_orders WHERE food_outlet_id = p_booth_id;

  -- Delete pending booth invitations
  DELETE FROM booth_invitations WHERE food_outlet_id = p_booth_id;

  -- Delete merchant memberships (vendor assignments)
  DELETE FROM merchant_memberships WHERE food_outlet_id = p_booth_id;

  -- Delete merchant handles if any exist
  DELETE FROM merchant_handles WHERE food_outlet_id = p_booth_id;

  -- Delete menu dishes
  DELETE FROM dishes WHERE food_outlet_id = p_booth_id;

  -- 4. Delete the booth slot
  DELETE FROM food_outlets WHERE id = p_booth_id;

  RETURN jsonb_build_object(
    'success', true,
    'boothId', p_booth_id,
    'boothName', target_booth_name
  );
END;
$$;
