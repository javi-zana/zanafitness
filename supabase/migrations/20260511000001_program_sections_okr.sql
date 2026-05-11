-- Allow 'okr' as a program_sections.section value so the program page can
-- store the per-member Objective + 3 Key Results template alongside split/food/habits.

ALTER TABLE program_sections
  DROP CONSTRAINT IF EXISTS program_sections_section_check;

ALTER TABLE program_sections
  ADD CONSTRAINT program_sections_section_check
  CHECK (section IN ('split', 'food', 'habits', 'okr'));
