import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ProgramClient from './ProgramClient'

export default async function ProgramPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: sections }, { data: principles }, { data: milestoneRows }] = await Promise.all([
    supabase
      .from('profiles')
      .select('first_name, role')
      .eq('id', user.id)
      .single(),
    supabase
      .from('program_sections')
      .select('section, content_json, updated_at')
      .eq('member_id', user.id),
    supabase
      .from('principles_doc')
      .select('content_json, updated_at')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single(),
    supabase
      .from('member_milestones')
      .select('type')
      .eq('member_id', user.id),
  ])

  const sectionMap = Object.fromEntries(
    (sections ?? []).map(s => [s.section, s])
  )

  return (
    <ProgramClient
      userId={user.id}
      firstName={profile?.first_name ?? null}
      role={profile?.role ?? 'member'}
      split={sectionMap['split'] ?? null}
      food={sectionMap['food'] ?? null}
      habits={sectionMap['habits'] ?? null}
      principles={principles ?? null}
      milestones={(milestoneRows ?? []).map(m => m.type as string)}
    />
  )
}
