-- Keep table creation available to the venue roles that manage table QR codes.
-- Recreate this policy so databases missing or carrying an older version of
-- migration 035 converge on the same owner/manager authorization rule.
DROP POLICY IF EXISTS "Restaurant owners can insert tables" ON public.hawker_tables;

CREATE POLICY "Restaurant owners can insert tables"
  ON public.hawker_tables
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.restaurant_memberships AS rm
      WHERE rm.user_id = (SELECT auth.uid())
        AND rm.restaurant_id = hawker_tables.restaurant_id
        AND rm.role IN ('owner', 'manager')
    )
  );
