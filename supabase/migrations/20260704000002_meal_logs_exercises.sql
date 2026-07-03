-- Meal photo log + exercise library (portal rebuild V1 logging foundation).

-- -------------------------------------------------------
-- 1. Meal logs — photo + optional note, habits-based (no macros by design)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS meal_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  photo_url    TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  note         TEXT CHECK (char_length(note) <= 280),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS meal_logs_member_created_idx
  ON meal_logs (member_id, created_at DESC);

ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member manages own meal logs"
  ON meal_logs FOR ALL
  USING (member_id = auth.uid())
  WITH CHECK (member_id = auth.uid());

CREATE POLICY "assigned coach reads meal logs"
  ON meal_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coach_assignments
      WHERE coach_assignments.member_id = meal_logs.member_id
        AND coach_assignments.coach_id  = auth.uid()
    )
  );

CREATE POLICY "head coach reads all meal logs"
  ON meal_logs FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach');

-- Public bucket, same model as progress-photos (public URLs, uploads go
-- through the service-role API route which scopes paths to the member id).
INSERT INTO storage.buckets (id, name, public)
VALUES ('meal-photos', 'meal-photos', true)
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------
-- 2. Exercise library — read-only reference data for autocomplete
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS exercises (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name      TEXT NOT NULL UNIQUE,
  body_part TEXT,
  equipment TEXT,
  target    TEXT
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated users read exercises"
  ON exercises FOR SELECT
  TO authenticated
  USING (true);
