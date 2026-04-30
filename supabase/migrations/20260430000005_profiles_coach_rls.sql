-- Allow coaches and head_coach to read member profiles.
-- Uses a SECURITY DEFINER function to avoid infinite recursion
-- (policies on profiles cannot subquery profiles directly).

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Helper: reads current user's role bypassing RLS
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

-- Users can always see and update their own profile
DROP POLICY IF EXISTS "users manage own profile" ON profiles;
CREATE POLICY "users manage own profile"
  ON profiles FOR ALL
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Head coach can read every profile (for admin + members tab)
DROP POLICY IF EXISTS "head coach reads all profiles" ON profiles;
CREATE POLICY "head coach reads all profiles"
  ON profiles FOR SELECT
  USING (get_my_role() = 'head_coach');

-- Coaches can read profiles of their assigned members
DROP POLICY IF EXISTS "coach reads assigned member profiles" ON profiles;
CREATE POLICY "coach reads assigned member profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coach_assignments
      WHERE coach_assignments.member_id = profiles.id
        AND coach_assignments.coach_id  = auth.uid()
    )
  );

-- Coaches can read other coaches' profiles (for admin tab coach list)
DROP POLICY IF EXISTS "coaches see other coaches" ON profiles;
CREATE POLICY "coaches see other coaches"
  ON profiles FOR SELECT
  USING (
    role IN ('coach', 'head_coach')
    AND get_my_role() IN ('coach', 'head_coach')
  );
