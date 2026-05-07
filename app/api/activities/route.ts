import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_KINDS = ['workout', 'win', 'meal'] as const
type Kind = (typeof ALLOWED_KINDS)[number]

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null) as { kind?: string; note?: string; confidence?: number } | null
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const { kind, note, confidence } = body

  if (!kind || !ALLOWED_KINDS.includes(kind as Kind)) {
    return NextResponse.json({ error: 'Invalid kind' }, { status: 400 })
  }
  if (typeof confidence !== 'number' || confidence < 1 || confidence > 10) {
    return NextResponse.json({ error: 'Confidence must be between 1 and 10' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('activities')
    .insert({
      member_id: user.id,
      kind,
      note: typeof note === 'string' && note.trim() ? note.trim() : null,
      confidence: Math.round(confidence),
    })
    .select('id, kind, note, confidence, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ activity: data })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json().catch(() => ({})) as { id?: string }
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  // RLS only lets the owning member delete (member_id = auth.uid())
  const { error } = await supabase.from('activities').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
