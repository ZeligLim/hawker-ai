CREATE TABLE rent_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  food_outlet_id UUID NOT NULL REFERENCES food_outlets(id) ON DELETE CASCADE,
  amount NUMERIC(8, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  description TEXT,
  payment_intent_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

ALTER TABLE rent_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins can view all rent invoices"
  ON rent_invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM platform_roles pr
      WHERE pr.user_id = auth.uid()
        AND pr.role IN ('superadmin', 'saas_owner', 'support')
    )
  );

CREATE POLICY "Venue owners can view their rent invoices"
  ON rent_invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_memberships rm
      WHERE rm.user_id = auth.uid()
        AND rm.restaurant_id = rent_invoices.restaurant_id
    )
  );

CREATE POLICY "Stall owners can view their rent invoices"
  ON rent_invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM merchant_memberships mm
      WHERE mm.user_id = auth.uid()
        AND mm.food_outlet_id = rent_invoices.food_outlet_id
    )
  );

CREATE POLICY "Venue owners can insert rent invoices"
  ON rent_invoices FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurant_memberships rm
      WHERE rm.user_id = auth.uid()
        AND rm.restaurant_id = rent_invoices.restaurant_id
        AND rm.role IN ('owner', 'manager')
    )
  );

CREATE POLICY "Venue owners can update rent invoices"
  ON rent_invoices FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_memberships rm
      WHERE rm.user_id = auth.uid()
        AND rm.restaurant_id = rent_invoices.restaurant_id
        AND rm.role IN ('owner', 'manager')
    )
  );

CREATE POLICY "Stall owners can update rent invoices (for payment)"
  ON rent_invoices FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM merchant_memberships mm
      WHERE mm.user_id = auth.uid()
        AND mm.food_outlet_id = rent_invoices.food_outlet_id
    )
  );

