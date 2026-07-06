import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import type { ReportContent } from '@/lib/report-template'
import HomeClient from './HomeClient'

const COACH_EMAILS = ['me@javilorenzana.com']

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

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [{ data: referralRow }, { data: okrRow }, { data: reportRows }, { data: mealRows }, { data: workoutDateRows }] = await Promise.all([
    supabase.from('referrals').select('code').eq('referrer_id', user.id).maybeSingle(),
    supabase
      .from('program_sections')
      .select('content_json')
      .eq('member_id', user.id)
      .eq('section', 'okr')
      .maybeSingle(),
    // RLS limits this to the member's own SENT reports.
    supabase
      .from('reports')
      .select('id, week_label, content_json, sent_at')
      .eq('member_id', user.id)
      .eq('status', 'sent')
      .order('created_at', { ascending: false }),
    supabase
      .from('meal_logs')
      .select('id, photo_url, note, created_at')
      .eq('member_id', user.id)
      .gte('created_at', todayStart.toISOString())
      .order('created_at', { ascending: false }),
    supabase
      .from('workout_logs')
      .select('logged_date')
      .eq('member_id', user.id)
      .order('logged_date', { ascending: false })
      .limit(60),
  ])

  const reports = (reportRows ?? []).map((r) => ({
    id: r.id as string,
    weekLabel: (r.week_label as string) ?? '',
    objective: ((r.content_json as ReportContent)?.objective as string) ?? '',
    sentAt: (r.sent_at as string) ?? null,
  }))

  return (
    <HomeClient
      firstName={profile?.first_name ?? null}
      avatarUrl={profile?.avatar_url ?? null}
      avatarColor={profile?.avatar_color ?? '#b0e455'}
      referralCode={referralRow?.code ?? null}
      okr={okrRow?.content_json ?? null}
      reports={reports}
      todayMeals={(mealRows ?? []) as { id: string; photo_url: string; note: string | null; created_at: string }[]}
      workoutDates={(workoutDateRows ?? []).map((w) => w.logged_date as string)}
    />
  )
}
