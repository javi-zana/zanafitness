import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { fetchActivities } from '@/utils/activities'
import DashboardClient from './DashboardClient'

const COACH_EMAILS = ['me@javilorenzana.com', 'bea.ongg@gmail.com']

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, role, avatar_color, avatar_url')
    .eq('id', user.id)
    .single()

  const isCoach =
    ['coach', 'head_coach'].includes(profile?.role ?? '') ||
    COACH_EMAILS.includes(user.email ?? '')

  if (isCoach) redirect('/coach')

  const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0]

  const [
    { data: thread },
    { data: milestoneRows },
    { data: referralRow },
    activities,
    { data: activityDateRows },
  ] = await Promise.all([
    supabase.from('threads').select('id').eq('member_id', user.id).maybeSingle(),
    supabase.from('member_milestones').select('type').eq('member_id', user.id),
    supabase.from('referrals').select('code').eq('referrer_id', user.id).maybeSingle(),
    fetchActivities(supabase, [user.id], 10),
    supabase
      .from('activities')
      .select('created_at')
      .eq('member_id', user.id)
      .gte('created_at', ninetyDaysAgo + 'T00:00:00'),
  ])

  let referralCode = referralRow?.code ?? null
  if (!referralCode) {
    const code = user.id.replace(/-/g, '').slice(0, 8).toUpperCase()
    const { data: newRef } = await supabase
      .from('referrals')
      .insert({ code, referrer_id: user.id })
      .select('code')
      .maybeSingle()
    referralCode = newRef?.code ?? null
  }

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

  const activeDates = Array.from(new Set(
    (activityDateRows ?? []).map(r => (r.created_at as string).split('T')[0])
  ))

  return (
    <DashboardClient
      userId={user.id}
      firstName={profile?.first_name ?? null}
      avatarUrl={profile?.avatar_url ?? null}
      avatarColor={profile?.avatar_color ?? '#b0e455'}
      activities={activities}
      activeDates={activeDates}
      milestones={(milestoneRows ?? []).map(m => m.type as string)}
      referralCode={referralCode}
      unreadCount={unreadCount}
    />
  )
}
