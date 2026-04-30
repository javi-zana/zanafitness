-- Remove all cross-user SELECT policies from profiles.
--
-- "coach reads assigned member profiles" queries coach_assignments, whose RLS
-- policies call get_my_role(), which queries profiles, which re-evaluates
-- profiles policies — causing infinite recursion on any profiles write.
--
-- All coach / head-coach reads of member profiles go through service role
-- (admin-data API route, coach/page.tsx server component), so this policy
-- is not needed for the app to work.

DROP POLICY IF EXISTS "coach reads assigned member profiles" ON profiles;

-- The only policy remaining on profiles should be:
--   "users manage own profile"  FOR ALL  USING (id = auth.uid())
