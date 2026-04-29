-- =============================================================
-- Zana rewrite: new tables + RLS
-- Applies AFTER the baseline migration pulled from production.
-- =============================================================

-- -------------------------------------------------------
-- 0. Profiles: add new fields
-- -------------------------------------------------------
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS first_name  TEXT,
  ADD COLUMN IF NOT EXISTS weight_unit TEXT NOT NULL DEFAULT 'kg' CHECK (weight_unit IN ('kg', 'lb'));

-- Extend role to include head_coach
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('member', 'coach', 'head_coach'));

-- -------------------------------------------------------
-- 1. Coach assignments
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS coach_assignments (
  member_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (member_id, coach_id)
);

ALTER TABLE coach_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members see own assignment"
  ON coach_assignments FOR SELECT
  USING (member_id = auth.uid());

CREATE POLICY "coaches see own assignments"
  ON coach_assignments FOR SELECT
  USING (coach_id = auth.uid());

CREATE POLICY "head coach reads all assignments"
  ON coach_assignments FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach');

CREATE POLICY "head coach manages assignments"
  ON coach_assignments FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach');

-- -------------------------------------------------------
-- 2. Stat updates
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS stat_updates (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  weight_kg      NUMERIC(5, 2),
  confidence     SMALLINT CHECK (confidence BETWEEN 1 AND 10),
  milestone_text TEXT CHECK (char_length(milestone_text) <= 280),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON stat_updates (member_id, created_at DESC);

ALTER TABLE stat_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member reads own stats"
  ON stat_updates FOR SELECT
  USING (member_id = auth.uid());

CREATE POLICY "member inserts own stats"
  ON stat_updates FOR INSERT
  WITH CHECK (member_id = auth.uid());

CREATE POLICY "member updates own stats"
  ON stat_updates FOR UPDATE
  USING (member_id = auth.uid())
  WITH CHECK (member_id = auth.uid());

CREATE POLICY "member deletes own stats"
  ON stat_updates FOR DELETE
  USING (member_id = auth.uid());

CREATE POLICY "assigned coach reads member stats"
  ON stat_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coach_assignments
      WHERE coach_assignments.member_id = stat_updates.member_id
        AND coach_assignments.coach_id  = auth.uid()
    )
  );

CREATE POLICY "head coach reads all stats"
  ON stat_updates FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach');

-- -------------------------------------------------------
-- 3. Stat update photos
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS stat_update_photos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_update_id UUID NOT NULL REFERENCES stat_updates(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON stat_update_photos (stat_update_id);

ALTER TABLE stat_update_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member reads own photos"
  ON stat_update_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stat_updates
      WHERE stat_updates.id        = stat_update_photos.stat_update_id
        AND stat_updates.member_id = auth.uid()
    )
  );

CREATE POLICY "member inserts own photos"
  ON stat_update_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stat_updates
      WHERE stat_updates.id        = stat_update_photos.stat_update_id
        AND stat_updates.member_id = auth.uid()
    )
  );

CREATE POLICY "member deletes own photos"
  ON stat_update_photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM stat_updates
      WHERE stat_updates.id        = stat_update_photos.stat_update_id
        AND stat_updates.member_id = auth.uid()
    )
  );

CREATE POLICY "assigned coach reads member photos"
  ON stat_update_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stat_updates
      JOIN coach_assignments ON coach_assignments.member_id = stat_updates.member_id
      WHERE stat_updates.id             = stat_update_photos.stat_update_id
        AND coach_assignments.coach_id  = auth.uid()
    )
  );

CREATE POLICY "head coach reads all photos"
  ON stat_update_photos FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach');

-- -------------------------------------------------------
-- 4. Program sections (Split / Food / Habits)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS program_sections (
  member_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  section      TEXT NOT NULL CHECK (section IN ('split', 'food', 'habits')),
  content_json JSONB NOT NULL DEFAULT '{}',
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by   UUID REFERENCES profiles(id),
  PRIMARY KEY (member_id, section)
);

ALTER TABLE program_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member reads own program"
  ON program_sections FOR SELECT
  USING (member_id = auth.uid());

CREATE POLICY "assigned coach reads member program"
  ON program_sections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coach_assignments
      WHERE coach_assignments.member_id = program_sections.member_id
        AND coach_assignments.coach_id  = auth.uid()
    )
  );

CREATE POLICY "assigned coach writes member program"
  ON program_sections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM coach_assignments
      WHERE coach_assignments.member_id = program_sections.member_id
        AND coach_assignments.coach_id  = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM coach_assignments
      WHERE coach_assignments.member_id = program_sections.member_id
        AND coach_assignments.coach_id  = auth.uid()
    )
  );

CREATE POLICY "head coach reads all programs"
  ON program_sections FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach');

CREATE POLICY "head coach writes all programs"
  ON program_sections FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach');

-- -------------------------------------------------------
-- 5. Principles doc (singleton)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS principles_doc (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_json JSONB NOT NULL DEFAULT '{}',
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by   UUID REFERENCES profiles(id),
  -- enforce singleton
  CONSTRAINT one_principles_doc CHECK (id = id)
);

-- Seed the singleton row
INSERT INTO principles_doc (id, content_json)
VALUES ('00000000-0000-0000-0000-000000000001', '{}')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE principles_doc ENABLE ROW LEVEL SECURITY;

CREATE POLICY "all members read principles"
  ON principles_doc FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "head coach writes principles"
  ON principles_doc FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach');

-- -------------------------------------------------------
-- 6. Messaging: threads
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS threads (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member reads own thread"
  ON threads FOR SELECT
  USING (member_id = auth.uid());

CREATE POLICY "assigned coach reads member thread"
  ON threads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coach_assignments
      WHERE coach_assignments.member_id = threads.member_id
        AND coach_assignments.coach_id  = auth.uid()
    )
  );

CREATE POLICY "head coach reads all threads"
  ON threads FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach');

CREATE POLICY "head coach manages threads"
  ON threads FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach');

-- -------------------------------------------------------
-- 7. Thread participants
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS thread_participants (
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role      TEXT NOT NULL CHECK (role IN ('member', 'coach', 'head_coach')),
  PRIMARY KEY (thread_id, user_id)
);

ALTER TABLE thread_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "participant reads own thread participants"
  ON thread_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM thread_participants tp2
      WHERE tp2.thread_id = thread_participants.thread_id
        AND tp2.user_id   = auth.uid()
    )
  );

CREATE POLICY "head coach manages thread participants"
  ON thread_participants FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach');

-- -------------------------------------------------------
-- 8. Messages
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON messages (thread_id, created_at DESC);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "thread participant reads messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM thread_participants
      WHERE thread_participants.thread_id = messages.thread_id
        AND thread_participants.user_id   = auth.uid()
    )
  );

CREATE POLICY "thread participant sends message"
  ON messages FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM thread_participants
      WHERE thread_participants.thread_id = messages.thread_id
        AND thread_participants.user_id   = auth.uid()
    )
  );

-- -------------------------------------------------------
-- 9. Message attachments
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS message_attachments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id   UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  kind         TEXT NOT NULL CHECK (kind IN ('image', 'pdf', 'other')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON message_attachments (message_id);

ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "thread participant reads attachments"
  ON message_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages
      JOIN thread_participants ON thread_participants.thread_id = messages.thread_id
      WHERE messages.id                 = message_attachments.message_id
        AND thread_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "thread participant uploads attachment"
  ON message_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM messages
      JOIN thread_participants ON thread_participants.thread_id = messages.thread_id
      WHERE messages.id                 = message_attachments.message_id
        AND thread_participants.user_id = auth.uid()
    )
  );

-- -------------------------------------------------------
-- 10. Message reads (last-read per participant)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS message_reads (
  thread_id    UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (thread_id, user_id)
);

ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user reads own read receipts"
  ON message_reads FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "user upserts own read receipt"
  ON message_reads FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Coaches need to see receipts for unread-count display
CREATE POLICY "assigned coach reads member receipt"
  ON message_reads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM threads
      JOIN coach_assignments ON coach_assignments.member_id = threads.member_id
      WHERE threads.id                  = message_reads.thread_id
        AND coach_assignments.coach_id  = auth.uid()
    )
  );

CREATE POLICY "head coach reads all receipts"
  ON message_reads FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach');

-- -------------------------------------------------------
-- 11. Community posts
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS community_posts (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sub_tab   TEXT NOT NULL CHECK (sub_tab IN ('announcements', 'wins', 'random')),
  title     TEXT NOT NULL,
  body_json JSONB NOT NULL DEFAULT '{}',
  hidden    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON community_posts (sub_tab, created_at DESC);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated reads visible posts"
  ON community_posts FOR SELECT
  TO authenticated
  USING (
    hidden = false
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach'
  );

-- members and coaches can post in wins/random
CREATE POLICY "member or coach posts in wins or random"
  ON community_posts FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND sub_tab IN ('wins', 'random')
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('member', 'coach', 'head_coach')
  );

-- only head_coach can post in announcements
CREATE POLICY "head coach posts anywhere"
  ON community_posts FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach'
  );

CREATE POLICY "author updates own post"
  ON community_posts FOR UPDATE
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid() AND hidden = false);

CREATE POLICY "head coach hides any post"
  ON community_posts FOR UPDATE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach');

-- -------------------------------------------------------
-- 12. Community post reactions
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS community_post_reactions (
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, user_id)
);

ALTER TABLE community_post_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated reads reactions"
  ON community_post_reactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "user reacts"
  ON community_post_reactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user removes own reaction"
  ON community_post_reactions FOR DELETE
  USING (user_id = auth.uid());

-- -------------------------------------------------------
-- 13. Community post comments
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS community_post_comments (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id   UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body      TEXT NOT NULL,
  hidden    BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON community_post_comments (post_id, created_at ASC);

ALTER TABLE community_post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated reads visible comments"
  ON community_post_comments FOR SELECT
  TO authenticated
  USING (
    hidden = false
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach'
  );

CREATE POLICY "authenticated comments"
  ON community_post_comments FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "author updates own comment"
  ON community_post_comments FOR UPDATE
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "head coach hides any comment"
  ON community_post_comments FOR UPDATE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach');

-- -------------------------------------------------------
-- 14. Supabase Realtime: enable for messaging
-- -------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE message_reads;

-- -------------------------------------------------------
-- 15. Backfill: assign all existing members to head coach
--     (Javi's user id will be resolved at run time via email)
-- -------------------------------------------------------
INSERT INTO coach_assignments (member_id, coach_id)
SELECT
  p.id AS member_id,
  (SELECT id FROM profiles WHERE email = 'me@javilorenzana.com' LIMIT 1) AS coach_id
FROM profiles p
WHERE p.role = 'member'
  AND NOT EXISTS (
    SELECT 1 FROM coach_assignments ca WHERE ca.member_id = p.id
  )
ON CONFLICT DO NOTHING;
