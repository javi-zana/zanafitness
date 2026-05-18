import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ProgramClient from './ProgramClient'

export default async function ProgramPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: sections }, { data: milestoneRows }, { data: notesRows }] = await Promise.all([
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
      .from('coach_notes')
      .select('id, author_id, body, created_at, updated_at, author:profiles!coach_notes_author_id_fkey(first_name, email)')
      .eq('member_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const sectionMap = Object.fromEntries(
    (sections ?? []).map(s => [s.section, s])
  )

  type NoteRow = {
    id: string
    author_id: string
    body: string
    created_at: string
    updated_at: string
    author: { first_name: string | null; email: string } | { first_name: string | null; email: string }[] | null
  }
  const notes = (notesRows ?? []).map((n: NoteRow) => {
    const a = Array.isArray(n.author) ? n.author[0] : n.author
    return {
      id: n.id,
      author_id: n.author_id,
      author_name: a?.first_name ?? a?.email?.split('@')[0] ?? 'Coach',
      body: n.body,
      created_at: n.created_at,
      updated_at: n.updated_at,
    }
  })

  return (
    <ProgramClient
      firstName={profile?.first_name ?? null}
      okr={sectionMap['okr'] ?? null}
      split={sectionMap['split'] ?? null}
      food={sectionMap['food'] ?? null}
      milestones={(milestoneRows ?? []).map(m => m.type as string)}
      notes={notes}
    />
  )
}
