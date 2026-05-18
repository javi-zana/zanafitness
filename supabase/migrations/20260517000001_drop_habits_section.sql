-- Remove the habits program section. The daily-checklist habit tracking feature
-- has been removed from the member and coach apps; this drops any stored rows
-- and tightens the CHECK constraint to disallow new ones.

DELETE FROM program_sections WHERE section = 'habits';

ALTER TABLE program_sections
  DROP CONSTRAINT IF EXISTS program_sections_section_check;

ALTER TABLE program_sections
  ADD CONSTRAINT program_sections_section_check
  CHECK (section IN ('split', 'food', 'okr'));
