-- ============================================================
-- AI Business OS — Orders & Order Items RLS Migration
-- ============================================================

-- 1. Enable Row Level Security (RLS) on orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies on orders if any (prevents conflicts)
DROP POLICY IF EXISTS "Users can view orders of their business" ON orders;
DROP POLICY IF EXISTS "Users can insert orders into their business" ON orders;
DROP POLICY IF EXISTS "Users can update orders of their business" ON orders;
DROP POLICY IF EXISTS "Users can delete orders of their business" ON orders;

-- 3. Create RLS Policies for orders
CREATE POLICY "Users can view orders of their business" 
  ON orders FOR SELECT 
  USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can insert orders into their business" 
  ON orders FOR INSERT 
  WITH CHECK (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can update orders of their business" 
  ON orders FOR UPDATE 
  USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can delete orders of their business" 
  ON orders FOR DELETE 
  USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

-- 4. Enable Row Level Security (RLS) on order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies on order_items if any
DROP POLICY IF EXISTS "Users can view order_items of their business" ON order_items;
DROP POLICY IF EXISTS "Users can insert order_items into their business" ON order_items;
DROP POLICY IF EXISTS "Users can update order_items of their business" ON order_items;
DROP POLICY IF EXISTS "Users can delete order_items of their business" ON order_items;

-- 6. Create RLS Policies for order_items
CREATE POLICY "Users can view order_items of their business" 
  ON order_items FOR SELECT 
  USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can insert order_items into their business" 
  ON order_items FOR INSERT 
  WITH CHECK (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can update order_items of their business" 
  ON order_items FOR UPDATE 
  USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can delete order_items of their business" 
  ON order_items FOR DELETE 
  USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );
