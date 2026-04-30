import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import DashboardClient from './DashboardClient'

const COACH_EMAILS = ['me@javilorenzana.com', 'bea.ongg@gmail.com']

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, role, avatar_color, avatar_url, fitness_goal, weight_unit')
    .eq('id', user.id)
    .single()

  const isCoach =
    ['coach', 'head_coach'].includes(profile?.role ?? '') ||
    COACH_EMAILS.includes(user.email ?? '')

  if (isCoach) redirect('/coach')

  const [{ data: stats }, { data: thread }, { data: latestAnn }] = await Promise.all([
    supabase
      .from('stat_updates')
      .select('id, weight_kg, confidence, milestone_text, created_at')
      .eq('member_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('threads')
      .select('id')
      .eq('member_id', user.id)
      .maybeSingle(),
    supabase
      .from('community_posts')
      .select('id, title, created_at')
      .eq('sub_tab', 'announcements')
      .eq('hidden', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  let unreadCount = 0
  if (thread) {
    const [{ data: coachMessages }, { data: myRead }] = await Promise.all([
      supabase
        .from('messages')
        .select('id, created_at')
        .eq('thread_id', thread.id)
        .neq('author_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('message_reads')
        .select('last_read_at')
        .eq('thread_id', thread.id)
        .eq('user_id', user.id)
        .maybeSingle(),
    ])
    const lastRead = myRead?.last_read_at ?? null
    unreadCount = (coachMessages ?? []).filter(
      m => !lastRead || new Date(m.created_at) > new Date(lastRead)
    ).length
  }

  const p = profile as Record<string, unknown> | null

  return (
    <DashboardClient
      firstName={(p?.first_name as string | null) ?? null}
      avatarUrl={(p?.avatar_url as string | null) ?? null}
      avatarColor={(p?.avatar_color as string | null) ?? '#b0e455'}
      fitnessGoal={(p?.fitness_goal as string | null) ?? null}
      weightUnit={((p?.weight_unit as string | null) as 'kg' | 'lb') ?? 'kg'}
      recentStats={stats ?? []}
      hasThread={!!thread}
      unreadCount={unreadCount}
      latestAnnouncement={latestAnn ?? null}
    />
  )
}
