import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import CoachClient from './CoachClient'

export default async function CoachPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, role, email, avatar_color, avatar_url')
    .eq('id', user.id)
    .single()

  // Coaches whose email is whitelisted always get through even if profile row is missing
  const COACH_EMAILS = ['me@javilorenzana.com', 'bea.ongg@gmail.com']
  const isWhitelisted = COACH_EMAILS.includes(user.email ?? '')
  if (!profile && !isWhitelisted) redirect('/login')
  if (profile && !['coach', 'head_coach'].includes(profile.role ?? '') && !isWhitelisted) {
    redirect('/login')
  }

  const role = profile?.role ?? (isWhitelisted ? 'head_coach' : 'coach')
  const isHeadCoach = role === 'head_coach'

  // Head coach sees all members; regular coach sees only assigned members
  let memberIds: string[] = []
  if (isHeadCoach) {
    const { data: allMemberProfiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'member')
    memberIds = (allMemberProfiles ?? []).map(m => m.id)
  } else {
    const { data: assignments } = await supabase
      .from('coach_assignments')
      .select('member_id')
      .eq('coach_id', user.id)
    memberIds = (assignments ?? []).map(a => a.member_id)
  }

  const [{ data: members }, { data: allStats }, { data: threads }] = await Promise.all([
    memberIds.length
      ? supabase.from('profiles').select('id, first_name, email, role, weight_unit').in('id', memberIds)
      : Promise.resolve({ data: [] }),
    memberIds.length
      ? supabase
          .from('stat_updates')
          .select('id, member_id, weight_kg, confidence, created_at')
          .in('member_id', memberIds)
          .order('created_at', { ascending: false })
          .limit(memberIds.length * 10)
      : Promise.resolve({ data: [] }),
    memberIds.length
      ? supabase.from('threads').select('id, member_id').in('member_id', memberIds)
      : Promise.resolve({ data: [] }),
  ])

  const threadIds = (threads ?? []).map(t => t.id)

  const [{ data: lastMessages }, { data: myReads }] = await Promise.all([
    threadIds.length
      ? supabase
          .from('messages')
          .select('thread_id, body, created_at, author_id')
          .in('thread_id', threadIds)
          .order('created_at', { ascending: false })
          .limit(threadIds.length * 3)
      : Promise.resolve({ data: [] }),
    threadIds.length
      ? supabase
          .from('message_reads')
          .select('thread_id, last_read_at')
          .eq('user_id', user.id)
          .in('thread_id', threadIds)
      : Promise.resolve({ data: [] }),
  ])

  return (
    <CoachClient
      userId={user.id}
      userEmail={user.email ?? ''}
      userRole={role}
      firstName={profile?.first_name ?? null}
      avatarColor={profile?.avatar_color ?? '#b0e455'}
      avatarUrl={profile?.avatar_url ?? null}
      members={(members ?? []) as { id: string; first_name: string | null; email: string; role: string; weight_unit: string | null }[]}
      allStats={(allStats ?? []) as { id: string; member_id: string; weight_kg: number | null; confidence: number | null; created_at: string }[]}
      threads={(threads ?? []) as { id: string; member_id: string }[]}
      lastMessages={(lastMessages ?? []) as { thread_id: string; body: string; created_at: string; author_id: string }[]}
      myReads={(myReads ?? []) as { thread_id: string; last_read_at: string }[]}
    />
  )
}
