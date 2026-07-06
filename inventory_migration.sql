-- ============================================================
-- AI Business OS — Inventory Module Migration
-- ============================================================

-- 1. Alter existing products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS supplier_name TEXT;

-- 2. Enable Row Level Security (RLS) on inventory
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies on inventory if any (prevents conflicts)
DROP POLICY IF EXISTS "Users can view inventory of their business" ON inventory;
DROP POLICY IF EXISTS "Users can insert inventory into their business" ON inventory;
DROP POLICY IF EXISTS "Users can update inventory of their business" ON inventory;
DROP POLICY IF EXISTS "Users can delete inventory of their business" ON inventory;

-- 4. Create RLS Policies for inventory
CREATE POLICY "Users can view inventory of their business" 
  ON inventory FOR SELECT 
  USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can insert inventory into their business" 
  ON inventory FOR INSERT 
  WITH CHECK (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can update inventory of their business" 
  ON inventory FOR UPDATE 
  USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can delete inventory of their business" 
  ON inventory FOR DELETE 
  USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- 5. Enable Row Level Security (RLS) on products (just in case it's missing)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 6. Drop existing policies on products if any
DROP POLICY IF EXISTS "Users can view products of their business" ON products;
DROP POLICY IF EXISTS "Users can insert products into their business" ON products;
DROP POLICY IF EXISTS "Users can update products of their business" ON products;
DROP POLICY IF EXISTS "Users can delete products of their business" ON products;

-- 7. Create RLS Policies for products
CREATE POLICY "Users can view products of their business" 
  ON products FOR SELECT 
  USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can insert products into their business" 
  ON products FOR INSERT 
  WITH CHECK (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can update products of their business" 
  ON products FOR UPDATE 
  USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can delete products of their business" 
  ON products FOR DELETE 
  USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );
