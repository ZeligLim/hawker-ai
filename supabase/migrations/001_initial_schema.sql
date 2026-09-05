CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  lat NUMERIC(9, 6) NOT NULL,
  lng NUMERIC(9, 6) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE food_outlets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (restaurant_id, name)
);

CREATE TABLE dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_outlet_id UUID NOT NULL REFERENCES food_outlets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(8, 2) NOT NULL CHECK (price >= 0),
  is_vegetarian BOOLEAN NOT NULL DEFAULT FALSE,
  is_halal BOOLEAN NOT NULL DEFAULT FALSE,
  spice_level SMALLINT NOT NULL DEFAULT 0 CHECK (spice_level BETWEEN 0 AND 5),
  protein_grams NUMERIC(8, 2) NOT NULL CHECK (protein_grams >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE dish_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_id UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (dish_id, ingredient_id)
);

CREATE INDEX idx_restaurants_slug ON restaurants(slug);
CREATE INDEX idx_food_outlets_restaurant_id ON food_outlets(restaurant_id);
CREATE INDEX idx_dishes_food_outlet_id ON dishes(food_outlet_id);
CREATE INDEX idx_dishes_price ON dishes(price);
CREATE INDEX idx_dishes_spice_level ON dishes(spice_level);
CREATE INDEX idx_dish_ingredients_dish_id ON dish_ingredients(dish_id);

ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE dish_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on restaurants" ON restaurants FOR SELECT USING (true);
CREATE POLICY "Allow public read access on food_outlets" ON food_outlets FOR SELECT USING (true);
CREATE POLICY "Allow public read access on dishes" ON dishes FOR SELECT USING (true);
CREATE POLICY "Allow public read access on ingredients" ON ingredients FOR SELECT USING (true);
CREATE POLICY "Allow public read access on dish_ingredients" ON dish_ingredients FOR SELECT USING (true);
