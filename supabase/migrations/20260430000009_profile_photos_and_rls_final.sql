-- Comprehensive fix: profiles RLS recursion + profile-photos storage policies

-- ── Profiles: drop all policies, recreate only the recursion-safe ones ─────────
-- The dropped policies (head coach reads all profiles, coaches see other coaches)
-- called get_my_role() which subqueries profiles inside a profiles policy → recursion.
-- All cross-user profile reads in the app now go through service role, so these
-- policies are not needed.

DROP POLICY IF EXISTS "head coach reads all profiles" ON profiles;
DROP POLICY IF EXISTS "coaches see other coaches" ON profiles;
DROP POLICY IF EXISTS "users manage own profile" ON profiles;
DROP POLICY IF EXISTS "coach reads assigned member profiles" ON profiles;

CREATE POLICY "users manage own profile"
  ON profiles FOR ALL
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "coach reads assigned member profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coach_assignments
      WHERE coach_assignments.member_id = profiles.id
        AND coach_assignments.coach_id = auth.uid()
    )
  );

-- ── Fix Joy's profile ──────────────────────────────────────────────────────────
UPDATE profiles SET role = 'member', status = 'active'
WHERE email = 'joy.ong@student.ateneo.edu';

INSERT INTO profiles (id, email, role, status)
SELECT id, email, 'member', 'active'
FROM auth.users
WHERE email = 'joy.ong@student.ateneo.edu'
ON CONFLICT (id) DO UPDATE SET role = 'member', status = 'active';

-- ── profile-photos storage bucket policies ─────────────────────────────────────
-- Bucket must be created manually in Supabase dashboard (Storage → New bucket)
-- and set to Public before these policies take effect.

DROP POLICY IF EXISTS "users upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "avatars are publicly readable" ON storage.objects;
DROP POLICY IF EXISTS "users delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "users update own avatar" ON storage.objects;

CREATE POLICY "users upload own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars are publicly readable"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'profile-photos');

CREATE POLICY "users delete own avatar"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "users update own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'profile-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
