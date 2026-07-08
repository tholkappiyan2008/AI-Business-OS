-- ============================================================
-- AI Business OS — Notifications Module Migration
-- Run in Supabase SQL Editor (idempotent)
-- ============================================================

-- 1. Create notifications table if it does not exist
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('alert', 'warning', 'approval', 'info')),
  category TEXT NOT NULL DEFAULT 'General',
  action_required BOOLEAN NOT NULL DEFAULT FALSE,
  approved BOOLEAN NOT NULL DEFAULT FALSE,
  rejected BOOLEAN NOT NULL DEFAULT FALSE,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_business_id ON notifications(business_id);
CREATE INDEX IF NOT EXISTS idx_notifications_business_unread ON notifications(business_id, is_read) WHERE is_read = FALSE;

-- 2. Add columns for existing deployments (safe if table was created above)
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General',
  ADD COLUMN IF NOT EXISTS action_required BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS rejected BOOLEAN DEFAULT FALSE;

-- 3. Backfill body from legacy desc column if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'desc'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'body'
  ) THEN
    UPDATE notifications SET body = COALESCE(body, desc) WHERE body IS NULL OR body = '';
  END IF;
END $$;

-- 4. Enable Row Level Security (RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view notifications of their business" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications into their business" ON notifications;
DROP POLICY IF EXISTS "Users can update notifications of their business" ON notifications;
DROP POLICY IF EXISTS "Users can delete notifications of their business" ON notifications;

-- 6. Create RLS Policies
CREATE POLICY "Users can view notifications of their business"
  ON notifications FOR SELECT
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE POLICY "Users can insert notifications into their business"
  ON notifications FOR INSERT
  WITH CHECK (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update notifications of their business"
  ON notifications FOR UPDATE
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete notifications of their business"
  ON notifications FOR DELETE
  USING (business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid()));
