-- Allow coaches and head_coach to read member profiles
-- The profiles table by default only lets users see their own row.
-- These policies extend that so coach pages can load member data.

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

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
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach');

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
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('coach', 'head_coach')
  );
