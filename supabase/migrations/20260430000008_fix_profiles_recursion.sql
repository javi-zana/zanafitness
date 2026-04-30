-- Drop the two SELECT policies on profiles that call get_my_role().
-- When any user saves their profile, Postgres evaluates SELECT policies for
-- the RETURNING clause. Those policies call get_my_role() → SELECT FROM profiles
-- → evaluates profiles policies again → infinite recursion.
--
-- These policies are not needed: all cross-user profile reads in the app go
-- through the service-role client (admin-data API, coach/page.tsx server
-- component), which bypasses RLS entirely.

DROP POLICY IF EXISTS "head coach reads all profiles" ON profiles;
DROP POLICY IF EXISTS "coaches see other coaches" ON profiles;

-- The remaining policies on profiles are safe:
--   "users manage own profile"        FOR ALL  USING (id = auth.uid())         ← no subquery
--   "coach reads assigned member profiles" FOR SELECT via coach_assignments     ← no profiles subquery
