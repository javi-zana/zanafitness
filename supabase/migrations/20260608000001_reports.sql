-- Reports: the weekly client report generated in the coach tool (ai.zanafitness.com)
-- and shown to the member in the app's Reports section.
--
-- content_json shape (mirrors the weekly-report template):
--   {
--     "greeting": string,
--     "objective": string,
--     "objective_subline": string,
--     "priorities": [{ "title": string, "detail": string }],
--     "levers": {
--       "training":  { "sub": string, "items": [string] },
--       "nutrition": { "sub": string, "items": [string] },
--       "lifestyle": { "sub": string, "items": [string] }
--     },
--     "coach_note": string
--   }
--
-- The coach tool authenticates by password (not Supabase auth) and reads/writes
-- via the SERVICE ROLE, which bypasses RLS. The RLS policies below exist for the
-- member app (read your own SENT reports) and the existing /coach app.

CREATE TABLE reports (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  author_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content_json JSONB NOT NULL DEFAULT '{}',
  week_label   TEXT,
  status       TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent')),
  share_token  TEXT NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text, '-', ''),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at      TIMESTAMPTZ
);

CREATE INDEX reports_member_created_idx ON reports (member_id, created_at DESC);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- ── SELECT ──────────────────────────────────────────────────────────────────
-- Members see only their own SENT reports (drafts stay hidden until sent).
CREATE POLICY "member reads own sent reports"
  ON reports FOR SELECT
  USING (member_id = auth.uid() AND status = 'sent');

CREATE POLICY "assigned coach reads reports"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coach_assignments
      WHERE coach_assignments.member_id = reports.member_id
        AND coach_assignments.coach_id  = auth.uid()
    )
  );

CREATE POLICY "head coach reads all reports"
  ON reports FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach');

-- ── INSERT ──────────────────────────────────────────────────────────────────
CREATE POLICY "assigned coach inserts reports"
  ON reports FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM coach_assignments
      WHERE coach_assignments.member_id = reports.member_id
        AND coach_assignments.coach_id  = auth.uid()
    )
  );

CREATE POLICY "head coach inserts reports"
  ON reports FOR INSERT
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach');

-- ── UPDATE ──────────────────────────────────────────────────────────────────
CREATE POLICY "assigned coach updates reports"
  ON reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM coach_assignments
      WHERE coach_assignments.member_id = reports.member_id
        AND coach_assignments.coach_id  = auth.uid()
    )
  );

CREATE POLICY "head coach updates any reports"
  ON reports FOR UPDATE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach');

-- ── DELETE ──────────────────────────────────────────────────────────────────
CREATE POLICY "head coach deletes any reports"
  ON reports FOR DELETE
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach');

-- ── updated_at trigger ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION reports_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION reports_set_updated_at();
