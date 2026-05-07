import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import MessagesClient from './MessagesClient'

function adminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = adminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('first_name, role, avatar_url, avatar_color')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'head_coach' || profile?.role === 'coach') redirect('/coach')

  const userProfile = {
    firstName: profile?.first_name ?? null,
    avatarUrl: profile?.avatar_url ?? null,
    avatarColor: profile?.avatar_color ?? '#b0e455',
  }

  // Load all threads this member is a participant of
  const { data: participations } = await admin
    .from('thread_participants')
    .select('thread_id')
    .eq('user_id', user.id)

  // Also include legacy thread via member_id
  const { data: legacyThread } = await admin
    .from('threads')
    .select('id')
    .eq('member_id', user.id)
    .maybeSingle()

  const threadIdSet = new Set([
    ...(participations ?? []).map(p => p.thread_id as string),
    ...(legacyThread ? [legacyThread.id as string] : []),
  ])
  const allThreadIds = Array.from(threadIdSet)

  const { data: threadsRaw } = allThreadIds.length
    ? await admin
        .from('threads')
        .select('id, member_id, thread_type, title, is_group, last_message_at')
        .in('id', allThreadIds)
    : { data: [] }

  // Load participants with profiles
  const { data: participantRows } = allThreadIds.length
    ? await admin.from('thread_participants').select('thread_id, user_id').in('thread_id', allThreadIds)
    : { data: [] }

  const participantUserIds = Array.from(new Set((participantRows ?? []).map(p => p.user_id as string)))
  const { data: participantProfiles } = participantUserIds.length
    ? await admin.from('profiles').select('id, first_name, avatar_url, avatar_color, role, email').in('id', participantUserIds)
    : { data: [] }

  const profileMap = Object.fromEntries((participantProfiles ?? []).map(p => [p.id as string, p]))

  const threads = (threadsRaw ?? []).map(t => ({
    id: t.id as string,
    member_id: t.member_id as string | null,
    thread_type: (t.thread_type ?? 'dm') as 'dm' | 'group_member' | 'coaches_group' | 'custom',
    title: t.title as string | null,
    is_group: t.is_group as boolean,
    last_message_at: t.last_message_at as string | null,
    participants: (participantRows ?? [])
      .filter(p => p.thread_id === t.id)
      .map(p => {
        const prof = profileMap[p.user_id as string]
        return {
          user_id: p.user_id as string,
          first_name: prof?.first_name ?? null,
          email: prof?.email ?? '',
          role: prof?.role ?? 'member',
          avatar_url: prof?.avatar_url ?? null,
          avatar_color: prof?.avatar_color ?? null,
        }
      }),
  }))

  // Mark all as read on load
  if (allThreadIds.length) {
    await admin.from('message_reads').upsert(
      allThreadIds.map(tid => ({ thread_id: tid, user_id: user.id, last_read_at: new Date().toISOString() }))
    )
  }

  return (
    <MessagesClient
      userId={user.id}
      threads={threads}
      userProfile={userProfile}
    />
  )
}
