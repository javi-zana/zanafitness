-- Group thread support
-- Run this in the Supabase SQL editor before using the group chat feature.

-- Allow threads to be "group" threads (not tied to a single member)
ALTER TABLE threads
  ADD COLUMN IF NOT EXISTS is_group   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS title      TEXT,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);

-- Make member_id nullable so group threads don't require one
ALTER TABLE threads ALTER COLUMN member_id DROP NOT NULL;

-- Participants table: who is in each thread
CREATE TABLE IF NOT EXISTS thread_participants (
  thread_id  UUID NOT NULL REFERENCES threads(id)   ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES profiles(id)  ON DELETE CASCADE,
  added_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  added_by   UUID REFERENCES profiles(id),
  PRIMARY KEY (thread_id, user_id)
);

ALTER TABLE thread_participants ENABLE ROW LEVEL SECURITY;

-- Members can read their own participation rows; coaches can read all
CREATE POLICY "participants_select" ON thread_participants
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('coach', 'head_coach')
    )
  );

-- Only coaches can manage participants
CREATE POLICY "participants_manage" ON thread_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('coach', 'head_coach')
    )
  );

-- Allow members to read messages in group threads they're part of
-- (add this to your existing messages RLS policy or create a new one)
CREATE POLICY "messages_group_thread_select" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM thread_participants tp
      WHERE tp.thread_id = messages.thread_id
        AND tp.user_id   = auth.uid()
    )
  );
