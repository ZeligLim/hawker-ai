-- Enable restaurant owners and managers to manage hawker tables
CREATE POLICY "Restaurant owners can insert tables"
  ON hawker_tables FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurant_memberships
      WHERE restaurant_memberships.user_id = auth.uid()
        AND restaurant_memberships.restaurant_id = hawker_tables.restaurant_id
        AND restaurant_memberships.role IN ('owner', 'manager')
    )
  );

CREATE POLICY "Restaurant owners can update tables"
  ON hawker_tables FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_memberships
      WHERE restaurant_memberships.user_id = auth.uid()
        AND restaurant_memberships.restaurant_id = hawker_tables.restaurant_id
        AND restaurant_memberships.role IN ('owner', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurant_memberships
      WHERE restaurant_memberships.user_id = auth.uid()
        AND restaurant_memberships.restaurant_id = hawker_tables.restaurant_id
        AND restaurant_memberships.role IN ('owner', 'manager')
    )
  );

CREATE POLICY "Restaurant owners can delete tables"
  ON hawker_tables FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_memberships
      WHERE restaurant_memberships.user_id = auth.uid()
        AND restaurant_memberships.restaurant_id = hawker_tables.restaurant_id
        AND restaurant_memberships.role IN ('owner', 'manager')
    )
  );

