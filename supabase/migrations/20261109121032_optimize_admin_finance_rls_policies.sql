DROP POLICY IF EXISTS "Anyone can read active platform plans" ON public.platform_plans;
DROP POLICY IF EXISTS "Platform admins manage platform plans" ON public.platform_plans;

CREATE POLICY "Read platform plans"
  ON public.platform_plans FOR SELECT
  TO anon, authenticated
  USING (is_active OR (SELECT public.is_platform_admin((SELECT auth.uid()))));

CREATE POLICY "Platform admins insert platform plans"
  ON public.platform_plans FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_platform_admin((SELECT auth.uid()))));

CREATE POLICY "Platform admins update platform plans"
  ON public.platform_plans FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_platform_admin((SELECT auth.uid()))))
  WITH CHECK ((SELECT public.is_platform_admin((SELECT auth.uid()))));

CREATE POLICY "Platform admins delete platform plans"
  ON public.platform_plans FOR DELETE
  TO authenticated
  USING ((SELECT public.is_platform_admin((SELECT auth.uid()))));

DROP POLICY IF EXISTS "Platform admins manage platform costs" ON public.platform_costs;

CREATE POLICY "Platform admins manage platform costs"
  ON public.platform_costs FOR ALL
  TO authenticated
  USING ((SELECT public.is_platform_admin((SELECT auth.uid()))))
  WITH CHECK ((SELECT public.is_platform_admin((SELECT auth.uid()))));
