import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { activity_id, body } = await req.json().catch(() => ({})) as { activity_id?: string; body?: string }
  if (!activity_id) return NextResponse.json({ error: 'activity_id required' }, { status: 400 })
  if (!body || typeof body !== 'string' || !body.trim()) {
    return NextResponse.json({ error: 'body required' }, { status: 400 })
  }
  if (body.length > 2000) return NextResponse.json({ error: 'Comment too long' }, { status: 400 })

  const { data, error } = await supabase
    .from('activity_comments')
    .insert({ activity_id, author_id: user.id, body: body.trim() })
    .select('id, activity_id, author_id, body, created_at')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ comment: data })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json().catch(() => ({})) as { id?: string }
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  // RLS only lets the author delete (author_id = auth.uid())
  const { error } = await supabase.from('activity_comments').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
