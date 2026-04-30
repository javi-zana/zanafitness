-- Fix profiles that have status='active' but no role set (e.g. came through LemonSqueezy webhook
-- which was missing the role field). Also explicitly fixes any known members by email.
-- Safe to re-run — only touches rows where role is currently null.

UPDATE profiles
SET role = 'member'
WHERE role IS NULL
  AND status = 'active';

-- Explicit fix for Joy in case her profile has a different status or no status at all
UPDATE profiles
SET role = 'member',
    status = 'active'
WHERE email = 'joy.ong@student.ateneo.edu'
  AND (role IS NULL OR role != 'member' OR status != 'active');

-- If Joy's profile doesn't exist at all, create it from auth.users
INSERT INTO profiles (id, email, role, status)
SELECT id, email, 'member', 'active'
FROM auth.users
WHERE email = 'joy.ong@student.ateneo.edu'
  AND NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'joy.ong@student.ateneo.edu')
ON CONFLICT (id) DO UPDATE
  SET role = 'member', status = 'active';
