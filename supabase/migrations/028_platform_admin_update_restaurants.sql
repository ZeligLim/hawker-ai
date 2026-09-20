-- Allow platform admins to update restaurants
DROP POLICY IF EXISTS "Owners can update their restaurants" ON restaurants;
CREATE POLICY "Owners can update their restaurants"
  ON restaurants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_memberships rm
      WHERE rm.restaurant_id = restaurants.id
        AND rm.user_id = auth.uid()
        AND rm.role IN ('owner', 'manager')
    ) OR is_platform_admin(auth.uid())
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurant_memberships rm
      WHERE rm.restaurant_id = restaurants.id
        AND rm.user_id = auth.uid()
        AND rm.role IN ('owner', 'manager')
    ) OR is_platform_admin(auth.uid())
  );
