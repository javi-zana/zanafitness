import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/ai-supabase'

// Meeting-notes notebook. Reuses coach_notes (so notes also feed report
// generation via fetchClientContext). The tool runs behind the password +
// service role, so we attribute notes to the head coach (Javi).

// coach_notes.author_id is NOT NULL, and the tool has no Supabase session, so
// resolve an author robustly: head coach → Javi's email → any coach.
async function headCoachId(supabase: ReturnType<typeof createServiceClient>): Promise<string | null> {
  const { data: head } = await supabase
    .from('profiles').select('id').eq('role', 'head_coach').limit(1).maybeSingle()
  if (head?.id) return head.id as string

  const { data: byEmail } = await supabase
    .from('profiles').select('id').eq('email', 'me@javilorenzana.com').maybeSingle()
  if (byEmail?.id) return byEmail.id as string

  const { data: anyCoach } = await supabase
    .from('profiles').select('id').in('role', ['head_coach', 'coach']).limit(1).maybeSingle()
  return (anyCoach?.id as string) ?? null
}

export async function POST(req: NextRequest) {
  const { memberId, body } = await req.json().catch(() => ({}))
  if (!memberId || !body?.trim()) {
    return NextResponse.json({ error: 'memberId and body required' }, { status: 400 })
  }
  const supabase = createServiceClient()
  const author = await headCoachId(supabase)
  if (!author) return NextResponse.json({ error: 'No head coach found' }, { status: 500 })

  const { data, error } = await supabase
    .from('coach_notes')
    .insert({ member_id: memberId, author_id: author, body: body.trim().slice(0, 5000) })
    .select('id, body, created_at')
    .single()
  if (error) {
    console.error('[ai/notes] insert error:', error)
    return NextResponse.json({ error: 'Could not save note' }, { status: 500 })
  }
  return NextResponse.json({ note: data })
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json().catch(() => ({}))
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const supabase = createServiceClient()
  const { error } = await supabase.from('coach_notes').delete().eq('id', id)
  if (error) {
    console.error('[ai/notes] delete error:', error)
    return NextResponse.json({ error: 'Could not delete note' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
