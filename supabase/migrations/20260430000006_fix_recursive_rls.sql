-- Fix all RLS policies that use (SELECT role FROM profiles WHERE id = auth.uid())
-- inside policies on profiles itself or on tables whose policies also query profiles.
-- Replaces them all with get_my_role() SECURITY DEFINER to avoid infinite recursion.

-- get_my_role() must exist first (created in migration 000005, but ensure it's here too)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

-- ── coach_assignments ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "head coach reads all assignments" ON coach_assignments;
CREATE POLICY "head coach reads all assignments"
  ON coach_assignments FOR SELECT
  USING (get_my_role() = 'head_coach');

DROP POLICY IF EXISTS "head coach manages assignments" ON coach_assignments;
CREATE POLICY "head coach manages assignments"
  ON coach_assignments FOR ALL
  USING (get_my_role() = 'head_coach')
  WITH CHECK (get_my_role() = 'head_coach');

-- ── stat_updates ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "head coach reads all stats" ON stat_updates;
CREATE POLICY "head coach reads all stats"
  ON stat_updates FOR SELECT
  USING (get_my_role() = 'head_coach');

-- ── stat_update_photos ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "head coach reads all photos" ON stat_update_photos;
CREATE POLICY "head coach reads all photos"
  ON stat_update_photos FOR SELECT
  USING (get_my_role() = 'head_coach');

-- ── program_sections ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "head coach reads all programs" ON program_sections;
CREATE POLICY "head coach reads all programs"
  ON program_sections FOR SELECT
  USING (get_my_role() = 'head_coach');

DROP POLICY IF EXISTS "head coach writes all programs" ON program_sections;
CREATE POLICY "head coach writes all programs"
  ON program_sections FOR ALL
  USING (get_my_role() = 'head_coach')
  WITH CHECK (get_my_role() = 'head_coach');

-- ── principles_doc ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "head coach writes principles" ON principles_doc;
CREATE POLICY "head coach writes principles"
  ON principles_doc FOR ALL
  USING (get_my_role() = 'head_coach')
  WITH CHECK (get_my_role() = 'head_coach');

-- ── threads ───────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "head coach reads all threads" ON threads;
CREATE POLICY "head coach reads all threads"
  ON threads FOR SELECT
  USING (get_my_role() = 'head_coach');

DROP POLICY IF EXISTS "head coach manages threads" ON threads;
CREATE POLICY "head coach manages threads"
  ON threads FOR ALL
  USING (get_my_role() = 'head_coach')
  WITH CHECK (get_my_role() = 'head_coach');

-- ── thread_participants ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "head coach manages thread participants" ON thread_participants;
CREATE POLICY "head coach manages thread participants"
  ON thread_participants FOR ALL
  USING (get_my_role() = 'head_coach')
  WITH CHECK (get_my_role() = 'head_coach');

-- ── message_reads ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "head coach reads all receipts" ON message_reads;
CREATE POLICY "head coach reads all receipts"
  ON message_reads FOR SELECT
  USING (get_my_role() = 'head_coach');

-- ── community_posts ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "authenticated reads visible posts" ON community_posts;
CREATE POLICY "authenticated reads visible posts"
  ON community_posts FOR SELECT
  TO authenticated
  USING (hidden = false OR get_my_role() = 'head_coach');

DROP POLICY IF EXISTS "member or coach posts in wins or random" ON community_posts;
CREATE POLICY "member or coach posts in wins or random"
  ON community_posts FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND sub_tab IN ('wins', 'random')
    AND get_my_role() IN ('member', 'coach', 'head_coach')
  );

DROP POLICY IF EXISTS "head coach posts anywhere" ON community_posts;
CREATE POLICY "head coach posts anywhere"
  ON community_posts FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND get_my_role() = 'head_coach'
  );

DROP POLICY IF EXISTS "head coach hides any post" ON community_posts;
CREATE POLICY "head coach hides any post"
  ON community_posts FOR UPDATE
  USING (get_my_role() = 'head_coach')
  WITH CHECK (get_my_role() = 'head_coach');

-- ── community_post_comments ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "authenticated reads visible comments" ON community_post_comments;
CREATE POLICY "authenticated reads visible comments"
  ON community_post_comments FOR SELECT
  TO authenticated
  USING (hidden = false OR get_my_role() = 'head_coach');

DROP POLICY IF EXISTS "head coach hides any comment" ON community_post_comments;
CREATE POLICY "head coach hides any comment"
  ON community_post_comments FOR UPDATE
  USING (get_my_role() = 'head_coach')
  WITH CHECK (get_my_role() = 'head_coach');

-- ── workout_logs ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "head coach reads all workout logs" ON workout_logs;
CREATE POLICY "head coach reads all workout logs"
  ON workout_logs FOR SELECT
  USING (get_my_role() = 'head_coach');

-- ── member_milestones ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "head coach reads all milestones" ON member_milestones;
CREATE POLICY "head coach reads all milestones"
  ON member_milestones FOR SELECT
  USING (get_my_role() = 'head_coach');

-- ── referrals ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "head coach reads all referrals" ON referrals;
CREATE POLICY "head coach reads all referrals"
  ON referrals FOR SELECT
  USING (get_my_role() = 'head_coach');

-- ── coach_assignments: fix Joy missing, remove Javi-to-self row ───────────────
DELETE FROM coach_assignments
  WHERE member_id = coach_id;

INSERT INTO coach_assignments (member_id, coach_id)
SELECT
  p.id,
  (SELECT id FROM profiles WHERE email = 'me@javilorenzana.com' LIMIT 1)
FROM profiles p
WHERE p.role = 'member'
  AND NOT EXISTS (
    SELECT 1 FROM coach_assignments ca WHERE ca.member_id = p.id
  )
ON CONFLICT DO NOTHING;
