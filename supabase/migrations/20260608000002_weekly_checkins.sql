-- Weekly check-in: the member's once-a-week self-report. Replaces the old
-- continuous stat logging. Members submit; coaches (and the coach tool, via
-- service role) read them to inform the weekly report.

CREATE TABLE weekly_checkins (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  week_label  TEXT,

  -- "On a scale of 1–10, how happy are you with your progress?"
  morale      SMALLINT CHECK (morale IS NULL OR (morale BETWEEN 1 AND 10)),

  -- "Any major changes needed to the program?"
  program_changes_needed  BOOLEAN,
  program_changes_details TEXT,

  -- 1–10 ratings
  rating_sleep                SMALLINT CHECK (rating_sleep IS NULL OR (rating_sleep BETWEEN 1 AND 10)),
  rating_energy               SMALLINT CHECK (rating_energy IS NULL OR (rating_energy BETWEEN 1 AND 10)),
  rating_strength             SMALLINT CHECK (rating_strength IS NULL OR (rating_strength BETWEEN 1 AND 10)),
  rating_stress               SMALLINT CHECK (rating_stress IS NULL OR (rating_stress BETWEEN 1 AND 10)),
  rating_workout_adherence    SMALLINT CHECK (rating_workout_adherence IS NULL OR (rating_workout_adherence BETWEEN 1 AND 10)),
  rating_nutrition_adherence  SMALLINT CHECK (rating_nutrition_adherence IS NULL OR (rating_nutrition_adherence BETWEEN 1 AND 10)),

  -- current weight this week (coach derives the change over time)
  weight_kg   NUMERIC(5, 2) CHECK (weight_kg IS NULL OR (weight_kg BETWEEN 30 AND 300)),

  -- "Did you go off-plan?"
  went_off_plan         BOOLEAN,
  went_off_plan_details TEXT,

  -- reflections
  proud_of    TEXT,
  improve     TEXT,
  comments    TEXT,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX weekly_checkins_member_created_idx ON weekly_checkins (member_id, created_at DESC);

ALTER TABLE weekly_checkins ENABLE ROW LEVEL SECURITY;

-- ── SELECT ──────────────────────────────────────────────────────────────────
CREATE POLICY "member reads own checkins"
  ON weekly_checkins FOR SELECT
  USING (member_id = auth.uid());

CREATE POLICY "assigned coach reads checkins"
  ON weekly_checkins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coach_assignments
      WHERE coach_assignments.member_id = weekly_checkins.member_id
        AND coach_assignments.coach_id  = auth.uid()
    )
  );

CREATE POLICY "head coach reads all checkins"
  ON weekly_checkins FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach');

-- ── INSERT ──────────────────────────────────────────────────────────────────
CREATE POLICY "member submits own checkin"
  ON weekly_checkins FOR INSERT
  WITH CHECK (member_id = auth.uid());

-- ── UPDATE ──────────────────────────────────────────────────────────────────
-- Members may edit their own check-in (e.g. fix a typo after submitting).
CREATE POLICY "member updates own checkin"
  ON weekly_checkins FOR UPDATE
  USING (member_id = auth.uid())
  WITH CHECK (member_id = auth.uid());
