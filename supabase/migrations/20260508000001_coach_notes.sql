-- Coach Notes: timestamped journal of coach observations attached to a member.
-- Members can read their own notes (transparent coaching). Any assigned coach + head coach
-- can read & insert. Authors can edit/delete their own entries; head coach can edit/delete any.

CREATE TABLE coach_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  body        TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 5000),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX coach_notes_member_created_idx ON coach_notes (member_id, created_at DESC);

ALTER TABLE coach_notes ENABLE ROW LEVEL SECURITY;

-- ── SELECT ──────────────────────────────────────────────────────────────────
CREATE POLICY "member reads own coach notes"
  ON coach_notes FOR SELECT
  USING (member_id = auth.uid());

CREATE POLICY "assigned coach reads coach notes"
  ON coach_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coach_assignments
      WHERE coach_assignments.member_id = coach_notes.member_id
        AND coach_assignments.coach_id  = auth.uid()
    )
  );

CREATE POLICY "head coach reads all coach notes"
  ON coach_notes FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach');

-- ── INSERT ──────────────────────────────────────────────────────────────────
CREATE POLICY "assigned coach inserts coach notes"
  ON coach_notes FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM coach_assignments
      WHERE coach_assignments.member_id = coach_notes.member_id
        AND coach_assignments.coach_id  = auth.uid()
    )
  );

CREATE POLICY "head coach inserts coach notes"
  ON coach_notes FOR INSERT
  WITH CHECK (
    author_id = auth.uid()
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach'
  );

-- ── UPDATE ──────────────────────────────────────────────────────────────────
CREATE POLICY "author updates own coach notes"
  ON coach_notes FOR UPDATE
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "head coach updates any coach notes"
  ON coach_notes FOR UPDATE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach');

-- ── DELETE ──────────────────────────────────────────────────────────────────
CREATE POLICY "author deletes own coach notes"
  ON coach_notes FOR DELETE
  USING (author_id = auth.uid());

CREATE POLICY "head coach deletes any coach notes"
  ON coach_notes FOR DELETE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach');

-- ── updated_at trigger ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION coach_notes_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER coach_notes_updated_at
  BEFORE UPDATE ON coach_notes
  FOR EACH ROW
  EXECUTE FUNCTION coach_notes_set_updated_at();
