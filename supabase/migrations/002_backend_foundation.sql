-- Backend foundation for table sessions, merchant ownership, dishes, and orders.

ALTER TABLE dishes
  ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS is_available BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS customizations JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_dishes_available ON dishes(is_available);
CREATE INDEX IF NOT EXISTS idx_dishes_tags ON dishes USING GIN(tags);

CREATE TABLE IF NOT EXISTS merchant_memberships (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  food_outlet_id UUID NOT NULL REFERENCES food_outlets(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'manager', 'staff')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, food_outlet_id)
);

CREATE TABLE IF NOT EXISTS hawker_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (restaurant_id, table_number)
);

CREATE TABLE IF NOT EXISTS table_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hawker_table_id UUID NOT NULL REFERENCES hawker_tables(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_merchant_memberships_outlet ON merchant_memberships(food_outlet_id);
CREATE INDEX IF NOT EXISTS idx_hawker_tables_restaurant ON hawker_tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_table_sessions_customer ON table_sessions(customer_id);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  table_session_id UUID REFERENCES table_sessions(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending_payment'
    CHECK (status IN ('pending_payment', 'paid', 'in_progress', 'partially_ready', 'ready', 'served', 'cancelled')),
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  service_fee NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (service_fee >= 0),
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  payment_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS merchant_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  food_outlet_id UUID NOT NULL REFERENCES food_outlets(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'waiting'
    CHECK (status IN ('waiting', 'accepted', 'preparing', 'ready', 'served', 'cancelled')),
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (order_id, food_outlet_id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  merchant_order_id UUID NOT NULL REFERENCES merchant_orders(id) ON DELETE CASCADE,
  dish_id UUID NOT NULL REFERENCES dishes(id) ON DELETE RESTRICT,
  dish_name TEXT NOT NULL,
  unit_price NUMERIC(8, 2) NOT NULL CHECK (unit_price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  customizations JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_merchant_orders_outlet ON merchant_orders(food_outlet_id, status);
CREATE INDEX IF NOT EXISTS idx_merchant_orders_order ON merchant_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

ALTER TABLE merchant_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE hawker_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their merchant memberships"
  ON merchant_memberships FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Members can create dishes for their stalls"
  ON dishes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM merchant_memberships
      WHERE merchant_memberships.user_id = auth.uid()
        AND merchant_memberships.food_outlet_id = dishes.food_outlet_id
    )
  );

CREATE POLICY "Members can update dishes for their stalls"
  ON dishes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM merchant_memberships
      WHERE merchant_memberships.user_id = auth.uid()
        AND merchant_memberships.food_outlet_id = dishes.food_outlet_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM merchant_memberships
      WHERE merchant_memberships.user_id = auth.uid()
        AND merchant_memberships.food_outlet_id = dishes.food_outlet_id
    )
  );

CREATE POLICY "Customers can view tables"
  ON hawker_tables FOR SELECT
  USING (true);

CREATE POLICY "Customers can manage their table sessions"
  ON table_sessions FOR ALL
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can view their orders"
  ON orders FOR SELECT
  USING (customer_id = auth.uid());

CREATE POLICY "Customers can create their orders"
  ON orders FOR INSERT
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Customers can view their order merchants"
  ON merchant_orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = merchant_orders.order_id
        AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Members can view their merchant orders"
  ON merchant_orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM merchant_memberships
      WHERE merchant_memberships.user_id = auth.uid()
        AND merchant_memberships.food_outlet_id = merchant_orders.food_outlet_id
    )
  );

CREATE POLICY "Members can update their merchant orders"
  ON merchant_orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM merchant_memberships
      WHERE merchant_memberships.user_id = auth.uid()
        AND merchant_memberships.food_outlet_id = merchant_orders.food_outlet_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM merchant_memberships
      WHERE merchant_memberships.user_id = auth.uid()
        AND merchant_memberships.food_outlet_id = merchant_orders.food_outlet_id
    )
  );

CREATE POLICY "Customers can view their order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.customer_id = auth.uid()
    )
  );

CREATE POLICY "Members can view their order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM merchant_orders
      JOIN merchant_memberships
        ON merchant_memberships.food_outlet_id = merchant_orders.food_outlet_id
      WHERE merchant_orders.id = order_items.merchant_order_id
        AND merchant_memberships.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create their order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.customer_id = auth.uid()
    )
  );
