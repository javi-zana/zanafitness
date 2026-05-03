-- coach_assignments had PRIMARY KEY (member_id, coach_id).
-- The upsert in admin-action uses onConflict:'member_id' which requires a
-- unique index on just member_id — that didn't exist, so every assign call
-- silently failed with a Postgres constraint error.
--
-- Business rule: one coach per member. Change PK to just member_id.

-- Remove any duplicates first (keep lowest coach_id per member)
DELETE FROM coach_assignments a
USING coach_assignments b
WHERE a.member_id = b.member_id
  AND a.coach_id > b.coach_id;

-- Rebuild primary key
ALTER TABLE coach_assignments DROP CONSTRAINT coach_assignments_pkey;
ALTER TABLE coach_assignments ADD PRIMARY KEY (member_id);
