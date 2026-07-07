-- ============================================================
-- AI Business OS — Expenses RLS Migration
-- ============================================================

-- 1. Enable RLS on expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies (prevents conflicts)
DROP POLICY IF EXISTS "Users can view expenses of their business" ON expenses;
DROP POLICY IF EXISTS "Users can insert expenses into their business" ON expenses;
DROP POLICY IF EXISTS "Users can update expenses of their business" ON expenses;
DROP POLICY IF EXISTS "Users can delete expenses of their business" ON expenses;

-- 3. Create RLS Policies for expenses
CREATE POLICY "Users can view expenses of their business"
  ON expenses FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE POLICY "Users can insert expenses into their business"
  ON expenses FOR INSERT
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update expenses of their business"
  ON expenses FOR UPDATE
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete expenses of their business"
  ON expenses FOR DELETE
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
