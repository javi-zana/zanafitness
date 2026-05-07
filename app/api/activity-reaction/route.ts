import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Toggle a like on an activity. POST to set, DELETE to unset.

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { activity_id } = await req.json().catch(() => ({})) as { activity_id?: string }
  if (!activity_id) return NextResponse.json({ error: 'activity_id required' }, { status: 400 })

  const { error } = await supabase
    .from('activity_reactions')
    .upsert(
      { activity_id, user_id: user.id, kind: 'like' },
      { onConflict: 'activity_id,user_id' }
    )
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { activity_id } = await req.json().catch(() => ({})) as { activity_id?: string }
  if (!activity_id) return NextResponse.json({ error: 'activity_id required' }, { status: 400 })

  const { error } = await supabase
    .from('activity_reactions')
    .delete()
    .eq('activity_id', activity_id)
    .eq('user_id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
