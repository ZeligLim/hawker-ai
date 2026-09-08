-- Migration 011: Enable Authenticated Users to Register Restaurants & Manage Food Outlets
-- Fixes: new row violates row-level security policy for table "restaurants"

-- 1. Restaurants: Allow authenticated users to insert new hawker centres / food halls
DROP POLICY IF EXISTS "Authenticated users can create restaurants" ON restaurants;
CREATE POLICY "Authenticated users can create restaurants"
  ON restaurants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- 2. Restaurants: Allow owners to delete their restaurants
DROP POLICY IF EXISTS "Owners can delete their restaurants" ON restaurants;
CREATE POLICY "Owners can delete their restaurants"
  ON restaurants FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_memberships rm
      WHERE rm.restaurant_id = restaurants.id
        AND rm.user_id = auth.uid()
        AND rm.role = 'owner'
    )
  );

-- 3. Food Outlets: Allow owners to delete food outlets for their restaurants
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

-- 4. Atomic Registration RPC Function (SECURITY DEFINER)
-- Creates restaurant, owner membership, and initial booth slots in a single transaction
CREATE OR REPLACE FUNCTION register_hawker_centre(
  p_name TEXT,
  p_slug TEXT,
  p_address TEXT,
  p_lat NUMERIC DEFAULT 0,
  p_lng NUMERIC DEFAULT 0,
  p_booth_count INTEGER DEFAULT 3,
  p_status TEXT DEFAULT 'approved'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  new_restaurant RECORD;
  clean_slug TEXT;
  i INTEGER;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  clean_slug := TRIM(p_slug);
  IF clean_slug IS NULL OR clean_slug = '' THEN
    clean_slug := LOWER(REGEXP_REPLACE(p_name, '[^a-zA-Z0-9]+', '-', 'g'));
  END IF;

  INSERT INTO restaurants (name, slug, address, lat, lng, status)
  VALUES (
    p_name,
    clean_slug,
    p_address,
    COALESCE(p_lat, 0),
    COALESCE(p_lng, 0),
    COALESCE(p_status, 'approved')
  )
  RETURNING * INTO new_restaurant;

  INSERT INTO restaurant_memberships (user_id, restaurant_id, role)
  VALUES (current_user_id, new_restaurant.id, 'owner')
  ON CONFLICT (user_id, restaurant_id) DO NOTHING;

  IF p_booth_count > 0 THEN
    FOR i IN 1..LEAST(p_booth_count, 20) LOOP
      INSERT INTO food_outlets (restaurant_id, name)
      VALUES (new_restaurant.id, 'Booth Slot #' || LPAD(i::TEXT, 2, '0'))
      ON CONFLICT (restaurant_id, name) DO NOTHING;
    END LOOP;
  END IF;

  RETURN jsonb_build_object(
    'id', new_restaurant.id,
    'name', new_restaurant.name,
    'slug', new_restaurant.slug,
    'address', new_restaurant.address,
    'lat', new_restaurant.lat,
    'lng', new_restaurant.lng,
    'status', new_restaurant.status,
    'created_at', new_restaurant.created_at
  );
END;
$$;

GRANT EXECUTE ON FUNCTION register_hawker_centre TO authenticated;
