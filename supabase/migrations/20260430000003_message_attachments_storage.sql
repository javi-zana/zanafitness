-- Storage RLS policies for message-attachments bucket
-- Bucket must already exist (create via Supabase dashboard)
-- Storage path convention: {threadId}/{messageId}/{filename}

-- Thread participants can upload attachments
CREATE POLICY "thread participants upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'message-attachments'
  AND EXISTS (
    SELECT 1 FROM thread_participants
    WHERE thread_participants.thread_id = ((storage.foldername(name))[1])::uuid
      AND thread_participants.user_id = auth.uid()
  )
);

-- Thread participants can read attachments
CREATE POLICY "thread participants read attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'message-attachments'
  AND EXISTS (
    SELECT 1 FROM thread_participants
    WHERE thread_participants.thread_id = ((storage.foldername(name))[1])::uuid
      AND thread_participants.user_id = auth.uid()
  )
);

-- Head coach can read all attachments
CREATE POLICY "head coach reads all attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'message-attachments'
  AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'head_coach'
);
