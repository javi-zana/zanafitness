-- -------------------------------------------------------
-- Attention snoozes (coach marks a member as addressed)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS attention_snoozes (
  coach_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  member_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  snoozed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (coach_id, member_id)
);

ALTER TABLE attention_snoozes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coach manages own snoozes"
  ON attention_snoozes FOR ALL
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());
