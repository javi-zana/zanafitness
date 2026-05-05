-- -------------------------------------------------------
-- Calorie logs (one per day per member)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS calorie_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logged_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  calories_eaten INTEGER NOT NULL CHECK (calories_eaten >= 0 AND calories_eaten <= 20000),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS calorie_logs_member_date
  ON calorie_logs (member_id, logged_date);
CREATE INDEX IF NOT EXISTS calorie_logs_member_date_desc
  ON calorie_logs (member_id, logged_date DESC);

ALTER TABLE calorie_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member manages own calorie logs"
  ON calorie_logs FOR ALL
  USING (member_id = auth.uid())
  WITH CHECK (member_id = auth.uid());

CREATE POLICY "assigned coach reads calorie logs"
  ON calorie_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coach_assignments
      WHERE coach_assignments.member_id = calorie_logs.member_id
        AND coach_assignments.coach_id  = auth.uid()
    )
  );

CREATE POLICY "head coach reads all calorie logs"
  ON calorie_logs FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach');

ALTER PUBLICATION supabase_realtime ADD TABLE calorie_logs;
