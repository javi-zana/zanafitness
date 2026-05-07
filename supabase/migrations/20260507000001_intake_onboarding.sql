-- Intake / onboarding fields on profiles.
-- Cross-user reads (coach → member) go through service role per
-- migration 20260430000010_profiles_single_policy, so no new RLS is needed.
-- The existing "users manage own profile" policy already lets members
-- write their own intake during onboarding.

ALTER TABLE profiles
  -- Personal basics
  ADD COLUMN IF NOT EXISTS gender                       TEXT
    CHECK (gender IS NULL OR gender IN ('male', 'female')),
  ADD COLUMN IF NOT EXISTS age                          SMALLINT
    CHECK (age IS NULL OR (age BETWEEN 13 AND 99)),
  ADD COLUMN IF NOT EXISTS height_cm                    NUMERIC(5,1)
    CHECK (height_cm IS NULL OR (height_cm BETWEEN 100 AND 250)),
  ADD COLUMN IF NOT EXISTS location                     TEXT,
  ADD COLUMN IF NOT EXISTS occupation                   TEXT,
  ADD COLUMN IF NOT EXISTS work_schedule                TEXT,

  -- Starting metrics
  ADD COLUMN IF NOT EXISTS starting_weight_kg           NUMERIC(5,2)
    CHECK (starting_weight_kg IS NULL OR (starting_weight_kg BETWEEN 30 AND 300)),
  ADD COLUMN IF NOT EXISTS starting_body_fat_pct        NUMERIC(4,1)
    CHECK (starting_body_fat_pct IS NULL OR (starting_body_fat_pct BETWEEN 3 AND 60)),
  ADD COLUMN IF NOT EXISTS waist_cm                     NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS chest_cm                     NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS hips_cm                      NUMERIC(5,1),

  -- Goal & motivation
  ADD COLUMN IF NOT EXISTS mirror_goal                  TEXT,
  ADD COLUMN IF NOT EXISTS target_date                  DATE,
  ADD COLUMN IF NOT EXISTS why_motivation               TEXT,
  ADD COLUMN IF NOT EXISTS success_vision               TEXT,

  -- Training
  ADD COLUMN IF NOT EXISTS training_years               TEXT,
  ADD COLUMN IF NOT EXISTS training_frequency_per_week  SMALLINT
    CHECK (training_frequency_per_week IS NULL OR (training_frequency_per_week BETWEEN 0 AND 14)),
  ADD COLUMN IF NOT EXISTS training_current_state       TEXT,
  ADD COLUMN IF NOT EXISTS training_access              TEXT,
  ADD COLUMN IF NOT EXISTS training_equipment           TEXT,
  ADD COLUMN IF NOT EXISTS training_injuries            TEXT,

  -- Diet
  ADD COLUMN IF NOT EXISTS diet_typical_day             TEXT,
  ADD COLUMN IF NOT EXISTS diet_meals_per_day           SMALLINT
    CHECK (diet_meals_per_day IS NULL OR (diet_meals_per_day BETWEEN 1 AND 10)),
  ADD COLUMN IF NOT EXISTS diet_who_cooks               TEXT,
  ADD COLUMN IF NOT EXISTS diet_restrictions            TEXT,
  ADD COLUMN IF NOT EXISTS diet_dislikes                TEXT,
  ADD COLUMN IF NOT EXISTS diet_alcohol_frequency       TEXT,
  ADD COLUMN IF NOT EXISTS diet_supplements             TEXT,
  ADD COLUMN IF NOT EXISTS diet_eating_out_frequency    TEXT,

  -- Lifestyle
  ADD COLUMN IF NOT EXISTS lifestyle_sleep_hours        NUMERIC(3,1)
    CHECK (lifestyle_sleep_hours IS NULL OR (lifestyle_sleep_hours BETWEEN 0 AND 24)),
  ADD COLUMN IF NOT EXISTS lifestyle_sleep_quality      TEXT,
  ADD COLUMN IF NOT EXISTS lifestyle_stress_level       SMALLINT
    CHECK (lifestyle_stress_level IS NULL OR (lifestyle_stress_level BETWEEN 1 AND 10)),
  ADD COLUMN IF NOT EXISTS lifestyle_travel_frequency   TEXT,
  ADD COLUMN IF NOT EXISTS lifestyle_energy_level       TEXT,

  -- Free-form notes (catch-all on the last intake screen)
  ADD COLUMN IF NOT EXISTS intake_notes                 TEXT,

  -- Meta
  ADD COLUMN IF NOT EXISTS onboarding_started_at        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS onboarded_at                 TIMESTAMPTZ;

-- Index on onboarded_at so the middleware gate is cheap
CREATE INDEX IF NOT EXISTS profiles_onboarded_at_idx ON profiles (onboarded_at);
