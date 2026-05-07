-- Activity log: unified post system replacing stat_updates / workout_logs / calorie_logs.
-- Members post lightweight updates (workout/win/meal) for their coach to see + engage with.

-- ── Drop legacy tables ──────────────────────────────────────────────────────
DROP TABLE IF EXISTS calorie_logs CASCADE;
DROP TABLE IF EXISTS workout_logs CASCADE;
DROP TABLE IF EXISTS stat_update_photos CASCADE;
DROP TABLE IF EXISTS stat_updates CASCADE;

-- ── activities ──────────────────────────────────────────────────────────────
CREATE TABLE activities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL CHECK (kind IN ('workout', 'win', 'meal')),
  note        TEXT,
  confidence  SMALLINT NOT NULL CHECK (confidence BETWEEN 1 AND 10),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX activities_member_created_idx ON activities (member_id, created_at DESC);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member manages own activities"
  ON activities FOR ALL
  USING (member_id = auth.uid())
  WITH CHECK (member_id = auth.uid());

CREATE POLICY "assigned coach reads activities"
  ON activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coach_assignments
      WHERE coach_assignments.member_id = activities.member_id
        AND coach_assignments.coach_id  = auth.uid()
    )
  );

CREATE POLICY "head coach reads all activities"
  ON activities FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach');

-- ── activity_photos ─────────────────────────────────────────────────────────
CREATE TABLE activity_photos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id  UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  photo_url    TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX activity_photos_activity_idx ON activity_photos (activity_id);

ALTER TABLE activity_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member manages own activity photos"
  ON activity_photos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM activities
      WHERE activities.id = activity_photos.activity_id
        AND activities.member_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM activities
      WHERE activities.id = activity_photos.activity_id
        AND activities.member_id = auth.uid()
    )
  );

CREATE POLICY "assigned coach reads activity photos"
  ON activity_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM activities a
      JOIN coach_assignments ca ON ca.member_id = a.member_id
      WHERE a.id = activity_photos.activity_id
        AND ca.coach_id = auth.uid()
    )
  );

CREATE POLICY "head coach reads all activity photos"
  ON activity_photos FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach');

-- ── activity_reactions (likes, bidirectional) ───────────────────────────────
CREATE TABLE activity_reactions (
  activity_id  UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  kind         TEXT NOT NULL DEFAULT 'like',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (activity_id, user_id)
);

ALTER TABLE activity_reactions ENABLE ROW LEVEL SECURITY;

-- Anyone who can see the activity can react. Reactions belong to the user.
CREATE POLICY "user manages own reactions"
  ON activity_reactions FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid()
    AND (
      -- Member reacting on own activity
      EXISTS (SELECT 1 FROM activities WHERE id = activity_reactions.activity_id AND member_id = auth.uid())
      -- Coach reacting on assigned member's activity
      OR EXISTS (
        SELECT 1 FROM activities a
        JOIN coach_assignments ca ON ca.member_id = a.member_id
        WHERE a.id = activity_reactions.activity_id AND ca.coach_id = auth.uid()
      )
      -- Head coach
      OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach'
    )
  );

CREATE POLICY "anyone with activity access reads reactions"
  ON activity_reactions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM activities WHERE id = activity_reactions.activity_id AND member_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM activities a
      JOIN coach_assignments ca ON ca.member_id = a.member_id
      WHERE a.id = activity_reactions.activity_id AND ca.coach_id = auth.uid()
    )
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach'
  );

-- ── activity_comments (bidirectional) ───────────────────────────────────────
CREATE TABLE activity_comments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id  UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  author_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body         TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX activity_comments_activity_idx ON activity_comments (activity_id, created_at);

ALTER TABLE activity_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "author manages own comments"
  ON activity_comments FOR ALL
  USING (author_id = auth.uid())
  WITH CHECK (
    author_id = auth.uid()
    AND (
      EXISTS (SELECT 1 FROM activities WHERE id = activity_comments.activity_id AND member_id = auth.uid())
      OR EXISTS (
        SELECT 1 FROM activities a
        JOIN coach_assignments ca ON ca.member_id = a.member_id
        WHERE a.id = activity_comments.activity_id AND ca.coach_id = auth.uid()
      )
      OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach'
    )
  );

CREATE POLICY "anyone with activity access reads comments"
  ON activity_comments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM activities WHERE id = activity_comments.activity_id AND member_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM activities a
      JOIN coach_assignments ca ON ca.member_id = a.member_id
      WHERE a.id = activity_comments.activity_id AND ca.coach_id = auth.uid()
    )
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach'
  );

-- ── activity-photos storage bucket ──────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('activity-photos', 'activity-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "activity photos publicly readable" ON storage.objects;
CREATE POLICY "activity photos publicly readable" ON storage.objects
  FOR SELECT USING (bucket_id = 'activity-photos');
