import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ProgramClient from './ProgramClient'

export default async function ProgramPage({
  searchParams,
}: {
  searchParams?: { log?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: sections }, { data: milestoneRows }, { data: workoutRows }] = await Promise.all([
    supabase
      .from('profiles')
      .select('first_name')
      .eq('id', user.id)
      .single(),
    supabase
      .from('program_sections')
      .select('section, content_json, updated_at')
      .eq('member_id', user.id),
    supabase
      .from('member_milestones')
      .select('type')
      .eq('member_id', user.id),
    supabase
      .from('workout_logs')
      .select('id, logged_date, notes')
      .eq('member_id', user.id)
      .order('logged_date', { ascending: false })
      .limit(30),
  ])

  const sectionMap = Object.fromEntries(
    (sections ?? []).map(s => [s.section, s])
  )

  return (
    <ProgramClient
      firstName={profile?.first_name ?? null}
      okr={sectionMap['okr'] ?? null}
      split={sectionMap['split'] ?? null}
      food={sectionMap['food'] ?? null}
      milestones={(milestoneRows ?? []).map(m => m.type as string)}
      workoutLogs={(workoutRows ?? []) as { id: string; logged_date: string; notes: Record<string, unknown> | string | null }[]}
      userId={user.id}
      autoLog={searchParams?.log === 'split'}
    />
  )
}
