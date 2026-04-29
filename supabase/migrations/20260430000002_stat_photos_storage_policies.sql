-- Storage RLS policies for stat-photos bucket
-- Bucket must already exist (created via Supabase dashboard)

-- Members can upload to their own folder ({userId}/...)
CREATE POLICY "members upload own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'stat-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Members can read their own photos; coaches can read assigned members' photos
CREATE POLICY "members and coaches read photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'stat-photos'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM coach_assignments
      WHERE coach_assignments.member_id = ((storage.foldername(name))[1])::uuid
        AND coach_assignments.coach_id  = auth.uid()
    )
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach'
  )
);

-- Members can delete their own photos
CREATE POLICY "members delete own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'stat-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
