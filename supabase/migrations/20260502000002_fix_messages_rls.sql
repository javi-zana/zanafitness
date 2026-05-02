-- Fix messages RLS: allow assigned coaches and head coaches to send/read messages,
-- not just thread_participants (which only includes Javi + the member on setup).

-- ── messages SELECT ───────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "thread participant reads messages" ON public.messages;

CREATE POLICY "coach or participant reads messages" ON public.messages
  FOR SELECT USING (
    -- Direct thread participant (member or whoever set up the thread)
    EXISTS (
      SELECT 1 FROM thread_participants
      WHERE thread_participants.thread_id = messages.thread_id
        AND thread_participants.user_id   = auth.uid()
    )
    OR
    -- Coach assigned to the member whose thread this is
    EXISTS (
      SELECT 1 FROM threads
      JOIN coach_assignments ON coach_assignments.member_id = threads.member_id
      WHERE threads.id = messages.thread_id
        AND coach_assignments.coach_id = auth.uid()
    )
    OR
    -- Any head coach
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id   = auth.uid()
        AND profiles.role = 'head_coach'
    )
  );

-- ── messages INSERT ───────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "thread participant sends message" ON public.messages;

CREATE POLICY "coach or participant sends message" ON public.messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND (
      EXISTS (
        SELECT 1 FROM thread_participants
        WHERE thread_participants.thread_id = messages.thread_id
          AND thread_participants.user_id   = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM threads
        JOIN coach_assignments ON coach_assignments.member_id = threads.member_id
        WHERE threads.id = messages.thread_id
          AND coach_assignments.coach_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id   = auth.uid()
          AND profiles.role = 'head_coach'
      )
    )
  );
