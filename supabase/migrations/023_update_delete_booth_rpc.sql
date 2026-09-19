-- Update delete_booth_slot to perform a soft delete instead of hard delete

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
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Authentication required.');
  END IF;

  SELECT restaurant_id, name INTO target_restaurant_id, target_booth_name
  FROM food_outlets
  WHERE id = p_booth_id;

  IF target_restaurant_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Booth slot not found.');
  END IF;

  SELECT role INTO caller_role
  FROM restaurant_memberships
  WHERE restaurant_id = target_restaurant_id
    AND user_id = current_user_id;

  IF caller_role IS NULL OR caller_role NOT IN ('owner', 'manager') THEN
    RETURN jsonb_build_object('error', 'Unauthorized: Only venue owners or managers can delete booth slots.');
  END IF;

  -- Soft delete the booth slot instead of hard deleting records
  UPDATE food_outlets
  SET deleted_at = NOW(), is_active = FALSE, status = 'closed', is_open = FALSE
  WHERE id = p_booth_id;

  -- Also invalidate pending booth invitations
  DELETE FROM booth_invitations WHERE food_outlet_id = p_booth_id;

  RETURN jsonb_build_object(
    'success', true,
    'boothId', p_booth_id,
    'boothName', target_booth_name
  );
END;
$$;
