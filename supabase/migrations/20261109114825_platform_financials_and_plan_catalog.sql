CREATE TABLE public.platform_plans (
  plan_key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  monthly_price NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (monthly_price >= 0),
  currency TEXT NOT NULL DEFAULT 'MYR' CHECK (currency = 'MYR'),
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  online_payments_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  features TEXT[] NOT NULL DEFAULT '{}',
  display_order SMALLINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT platform_plans_key_check CHECK (plan_key IN ('ordering', 'online_payments'))
);

ALTER TABLE public.platform_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active platform plans"
  ON public.platform_plans FOR SELECT
  TO anon, authenticated
  USING (is_active OR public.is_platform_admin(auth.uid()));

CREATE POLICY "Platform admins manage platform plans"
  ON public.platform_plans FOR ALL
  TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

INSERT INTO public.platform_plans
  (plan_key, name, description, monthly_price, currency, is_active, online_payments_enabled, features, display_order)
VALUES
  (
    'ordering',
    'Level 1 · Ordering',
    'QR menus and order submission with payment at the stall counter.',
    0,
    'MYR',
    TRUE,
    FALSE,
    ARRAY['Centre QR menus and order submission', 'Live stall order management', 'Pay at the stall counter'],
    1
  ),
  (
    'online_payments',
    'Level 2 · Online payments',
    'Online checkout and payment status after a payment provider is integrated.',
    0,
    'MYR',
    FALSE,
    TRUE,
    ARRAY['Online checkout through a configured provider', 'Payment status and provider-dependent refunds'],
    2
  )
ON CONFLICT (plan_key) DO NOTHING;

CREATE TABLE public.platform_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incurred_on DATE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('hosting', 'infrastructure', 'software', 'other')),
  vendor TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'MYR' CHECK (currency = 'MYR'),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX platform_costs_incurred_on_idx ON public.platform_costs (incurred_on DESC);
ALTER TABLE public.platform_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform admins manage platform costs"
  ON public.platform_costs FOR ALL
  TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));
