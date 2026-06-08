import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/ai-supabase'

// Save (create or update) a report draft.
export async function POST(req: NextRequest) {
  const { id, memberId, weekLabel, content } = await req.json().catch(() => ({}))
  if (!memberId || !content) {
    return NextResponse.json({ error: 'memberId and content required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Attribute the report to the head coach (Javi).
  const { data: head } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'head_coach')
    .limit(1)
    .maybeSingle()

  if (id) {
    const { data, error } = await supabase
      .from('reports')
      .update({ content_json: content, week_label: weekLabel ?? null })
      .eq('id', id)
      .select('id')
      .single()
    if (error) {
      console.error('[ai/reports] update error:', error)
      return NextResponse.json({ error: 'Save failed' }, { status: 500 })
    }
    return NextResponse.json({ id: data.id })
  }

  const { data, error } = await supabase
    .from('reports')
    .insert({
      member_id: memberId,
      author_id: head?.id ?? null,
      content_json: content,
      week_label: weekLabel ?? null,
      status: 'draft',
    })
    .select('id')
    .single()
  if (error) {
    console.error('[ai/reports] insert error:', error)
    return NextResponse.json({ error: 'Save failed' }, { status: 500 })
  }
  return NextResponse.json({ id: data.id })
}
