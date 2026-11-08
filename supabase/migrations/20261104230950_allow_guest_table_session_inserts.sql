REVOKE ALL PRIVILEGES ON TABLE public.table_sessions FROM anon;
GRANT INSERT ON TABLE public.table_sessions TO anon;

DROP POLICY IF EXISTS "Guests can create table sessions" ON public.table_sessions;
CREATE POLICY "Guests can create table sessions"
  ON public.table_sessions
  FOR INSERT
  TO anon
  WITH CHECK (customer_id IS NULL AND status = 'active');