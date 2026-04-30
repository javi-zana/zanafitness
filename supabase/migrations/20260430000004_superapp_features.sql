-- =============================================================
-- Zana superapp features: workout logs, milestones, referrals
-- =============================================================

-- -------------------------------------------------------
-- 1. Workout logs (one per day per member)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS workout_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes       TEXT CHECK (char_length(notes) <= 500),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS workout_logs_member_date
  ON workout_logs (member_id, logged_date);
CREATE INDEX IF NOT EXISTS workout_logs_member_date_desc
  ON workout_logs (member_id, logged_date DESC);

ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member manages own workout logs"
  ON workout_logs FOR ALL
  USING (member_id = auth.uid())
  WITH CHECK (member_id = auth.uid());

CREATE POLICY "assigned coach reads workout logs"
  ON workout_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coach_assignments
      WHERE coach_assignments.member_id = workout_logs.member_id
        AND coach_assignments.coach_id  = auth.uid()
    )
  );

CREATE POLICY "head coach reads all workout logs"
  ON workout_logs FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach');

-- -------------------------------------------------------
-- 2. Member milestones (one row per milestone type)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS member_milestones (
  member_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (member_id, type)
);

ALTER TABLE member_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member reads own milestones"
  ON member_milestones FOR SELECT
  USING (member_id = auth.uid());

CREATE POLICY "member inserts own milestones"
  ON member_milestones FOR INSERT
  WITH CHECK (member_id = auth.uid());

CREATE POLICY "assigned coach reads milestones"
  ON member_milestones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coach_assignments
      WHERE coach_assignments.member_id = member_milestones.member_id
        AND coach_assignments.coach_id  = auth.uid()
    )
  );

CREATE POLICY "head coach reads all milestones"
  ON member_milestones FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach');

-- -------------------------------------------------------
-- 3. Referrals (one referral code per member)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS referrals (
  code        TEXT PRIMARY KEY,
  referrer_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS referrals_referrer ON referrals (referrer_id);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member reads own referral code"
  ON referrals FOR SELECT
  USING (referrer_id = auth.uid());

CREATE POLICY "member creates own referral code"
  ON referrals FOR INSERT
  WITH CHECK (referrer_id = auth.uid());

CREATE POLICY "head coach reads all referrals"
  ON referrals FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach');

-- -------------------------------------------------------
-- 4. Realtime
-- -------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE workout_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE member_milestones;
