-- Migration 018: Platform Admin RBAC & Monetization Guard
-- Restricts sensitive platform monetization and charge settings strictly to SaaS superadmins and platform owners.

-- 1. Create table for platform-level roles
CREATE TABLE IF NOT EXISTS platform_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('superadmin', 'saas_owner', 'support')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on platform_roles
ALTER TABLE platform_roles ENABLE ROW LEVEL SECURITY;

-- 2. Helper function to check if a user is a platform admin (superadmin or saas_owner)
CREATE OR REPLACE FUNCTION is_platform_admin(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM platform_roles
    WHERE user_id = check_user_id
      AND role IN ('superadmin', 'saas_owner')
  );
$$;

-- 3. Row Level Security policies for platform_roles
DROP POLICY IF EXISTS "Users can read own platform role or admins read all" ON platform_roles;
CREATE POLICY "Users can read own platform role or admins read all"
  ON platform_roles FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR is_platform_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Only superadmins can insert platform roles" ON platform_roles;
CREATE POLICY "Only superadmins can insert platform roles"
  ON platform_roles FOR INSERT
  TO authenticated
  WITH CHECK (is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Only superadmins can update platform roles" ON platform_roles;
CREATE POLICY "Only superadmins can update platform roles"
  ON platform_roles FOR UPDATE
  TO authenticated
  USING (is_platform_admin(auth.uid()))
  WITH CHECK (is_platform_admin(auth.uid()));

DROP POLICY IF EXISTS "Only superadmins can delete platform roles" ON platform_roles;
CREATE POLICY "Only superadmins can delete platform roles"
  ON platform_roles FOR DELETE
  TO authenticated
  USING (is_platform_admin(auth.uid()));

-- 4. PostgreSQL Trigger to block non-admins from modifying monetization columns
-- Even if an attacker manipulates client code or calls PostgREST directly with a shop-owner JWT,
-- this trigger aborts the transaction at the database engine level.
CREATE OR REPLACE FUNCTION enforce_monetization_modification_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Detect modifications to sensitive pricing/monetization fields
  IF (OLD.fee_payer IS DISTINCT FROM NEW.fee_payer) OR
     (OLD.platform_fee_fixed IS DISTINCT FROM NEW.platform_fee_fixed) OR
     (OLD.platform_fee_percent IS DISTINCT FROM NEW.platform_fee_percent) THEN
    
    -- Block if current caller is NOT a superadmin/saas_owner (allow service_role)
    IF NOT is_platform_admin(auth.uid()) AND (current_user != 'service_role') THEN
      RAISE EXCEPTION 'Access Denied: Only SaaS superadmins or platform owners are authorized to configure platform fee rates and monetization models.'
        USING ERRCODE = '42501'; -- insufficient_privilege
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_restaurant_monetization ON restaurants;
CREATE TRIGGER trg_enforce_restaurant_monetization
  BEFORE UPDATE ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION enforce_monetization_modification_guard();

DROP TRIGGER IF EXISTS trg_enforce_outlet_monetization ON food_outlets;
CREATE TRIGGER trg_enforce_outlet_monetization
  BEFORE UPDATE ON food_outlets
  FOR EACH ROW
  EXECUTE FUNCTION enforce_monetization_modification_guard();

-- 5. RPC function to safely fetch monetization settings for authorized platform admins only
CREATE OR REPLACE FUNCTION get_restaurant_monetization_settings(p_restaurant_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fee_payer VARCHAR(20);
  v_fee_fixed NUMERIC(10,2);
  v_fee_percent NUMERIC(5,4);
BEGIN
  IF NOT is_platform_admin(auth.uid()) AND (current_user != 'service_role') THEN
    RAISE EXCEPTION 'Access Denied: You do not have permission to view sensitive platform monetization settings.'
      USING ERRCODE = '42501';
  END IF;

  SELECT fee_payer, platform_fee_fixed, platform_fee_percent
  INTO v_fee_payer, v_fee_fixed, v_fee_percent
  FROM restaurants
  WHERE id = p_restaurant_id;

  RETURN jsonb_build_object(
    'fee_payer', v_fee_payer,
    'platform_fee_fixed', v_fee_fixed,
    'platform_fee_percent', v_fee_percent
  );
END;
$$;
