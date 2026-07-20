-- notes stores the structured JSON workout payload (v2), not free text.
-- The old 500-char cap rejected any real multi-exercise session (a 6-exercise
-- day serializes to ~900+ chars) — the "Save errored" bug. 10k bounds abuse only.
ALTER TABLE workout_logs DROP CONSTRAINT IF EXISTS workout_logs_notes_check;
ALTER TABLE workout_logs ADD CONSTRAINT workout_logs_notes_check CHECK (char_length(notes) <= 10000);
