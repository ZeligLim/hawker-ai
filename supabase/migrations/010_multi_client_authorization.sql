-- Migration 010: Multi-Client Platform Authorization & Cross-Access Isolation
-- Enforces strict PostgreSQL Row Level Security (RLS) separating:
-- 1. Customer Client
-- 2. Stall Worker Client
-- 3. Shop Owner Client

-- 1. Restaurants: Restrict modification to authorized shop owners & managers
DROP POLICY IF EXISTS "Owners can update their restaurants" ON restaurants;
CREATE POLICY "Owners can update their restaurants"
  ON restaurants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_memberships rm
      WHERE rm.restaurant_id = restaurants.id
        AND rm.user_id = auth.uid()
        AND rm.role IN ('owner', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurant_memberships rm
      WHERE rm.restaurant_id = restaurants.id
        AND rm.user_id = auth.uid()
        AND rm.role IN ('owner', 'manager')
    )
  );

-- 2. Food Outlets (Stalls / Booths): Restrict creation and updates to authorized shop owners
DROP POLICY IF EXISTS "Owners can insert food outlets for their restaurants" ON food_outlets;
CREATE POLICY "Owners can insert food outlets for their restaurants"
  ON food_outlets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurant_memberships rm
      WHERE rm.restaurant_id = food_outlets.restaurant_id
        AND rm.user_id = auth.uid()
        AND rm.role IN ('owner', 'manager')
    )
  );

DROP POLICY IF EXISTS "Owners can update food outlets for their restaurants" ON food_outlets;
CREATE POLICY "Owners can update food outlets for their restaurants"
  ON food_outlets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM restaurant_memberships rm
      WHERE rm.restaurant_id = food_outlets.restaurant_id
        AND rm.user_id = auth.uid()
        AND rm.role IN ('owner', 'manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurant_memberships rm
      WHERE rm.restaurant_id = food_outlets.restaurant_id
        AND rm.user_id = auth.uid()
        AND rm.role IN ('owner', 'manager')
    )
  );

-- 3. Dishes: Allow Stall Workers and Shop Owners to delete dishes
DROP POLICY IF EXISTS "Members can delete dishes for their stalls" ON dishes;
CREATE POLICY "Members can delete dishes for their stalls"
  ON dishes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM merchant_memberships mm
      WHERE mm.user_id = auth.uid()
        AND mm.food_outlet_id = dishes.food_outlet_id
    )
    OR EXISTS (
      SELECT 1 FROM food_outlets fo
      JOIN restaurant_memberships rm ON rm.restaurant_id = fo.restaurant_id
      WHERE fo.id = dishes.food_outlet_id
        AND rm.user_id = auth.uid()
        AND rm.role IN ('owner', 'manager')
    )
  );

-- 4. Merchant Orders Isolation:
-- Ensure a stall worker can ONLY see tickets for their assigned stall
-- and customers can ONLY see items belonging to their own order.
DROP POLICY IF EXISTS "Members can view their merchant orders" ON merchant_orders;
CREATE POLICY "Members can view their merchant orders"
  ON merchant_orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM merchant_memberships mm
      WHERE mm.user_id = auth.uid()
        AND mm.food_outlet_id = merchant_orders.food_outlet_id
    )
    OR EXISTS (
      SELECT 1 FROM food_outlets fo
      JOIN restaurant_memberships rm ON rm.restaurant_id = fo.restaurant_id
      WHERE fo.id = merchant_orders.food_outlet_id
        AND rm.user_id = auth.uid()
        AND rm.role IN ('owner', 'manager')
    )
    OR EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = merchant_orders.order_id
        AND o.customer_id = auth.uid()
    )
  );

-- 5. Orders: Ensure customers can only see and manage their own orders
DROP POLICY IF EXISTS "Customers can view their orders" ON orders;
CREATE POLICY "Customers can view their orders"
  ON orders FOR SELECT
  USING (customer_id = auth.uid());

DROP POLICY IF EXISTS "Customers can create their orders" ON orders;
CREATE POLICY "Customers can create their orders"
  ON orders FOR INSERT
  WITH CHECK (customer_id = auth.uid());
