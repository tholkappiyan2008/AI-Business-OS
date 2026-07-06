-- ============================================================
-- AI Business OS — CRM Module Migration
-- ============================================================

-- 1. Alter existing customers table safely
ALTER TABLE customers
ADD COLUMN name TEXT,
ADD COLUMN company TEXT,
ADD COLUMN status TEXT DEFAULT 'Active';

-- Populate 'name' using existing data if any
UPDATE customers 
SET name = COALESCE(first_name || ' ' || last_name, 'Unknown')
WHERE name IS NULL;

-- Enforce constraints
ALTER TABLE customers ALTER COLUMN name SET NOT NULL;

-- Drop old columns
ALTER TABLE customers
DROP COLUMN first_name,
DROP COLUMN last_name,
DROP COLUMN address;

-- 2. Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if any (prevents conflicts if run multiple times)
DROP POLICY IF EXISTS "Users can view customers of their business" ON customers;
DROP POLICY IF EXISTS "Users can insert customers into their business" ON customers;
DROP POLICY IF EXISTS "Users can update customers of their business" ON customers;
DROP POLICY IF EXISTS "Users can delete customers of their business" ON customers;

-- 4. Create RLS Policies
CREATE POLICY "Users can view customers of their business" 
  ON customers FOR SELECT 
  USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can insert customers into their business" 
  ON customers FOR INSERT 
  WITH CHECK (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can update customers of their business" 
  ON customers FOR UPDATE 
  USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can delete customers of their business" 
  ON customers FOR DELETE 
  USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
  );
