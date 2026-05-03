-- Set correct first names for coaches.
-- Without these, the UI falls back to email local-part:
--   me@javilorenzana.com → "me"  → initial "M"
--   bea.ongg@gmail.com   → "bea" → initial "B" (but name should be MJ)

UPDATE profiles SET first_name = 'Javi' WHERE email = 'me@javilorenzana.com';
UPDATE profiles SET first_name = 'MJ'   WHERE email = 'bea.ongg@gmail.com';
