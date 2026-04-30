import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

function adminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function getJaviUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'me@javilorenzana.com') return null
  return user
}

export async function POST(req: NextRequest) {
  const user = await getJaviUser()
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { action } = body
  const admin = adminClient()

  // ── Setup messaging thread for a member ──────────────────────────────────
  if (action === 'setup_thread') {
    const { memberId } = body
    if (!memberId) return NextResponse.json({ error: 'memberId required' }, { status: 400 })

    const { data: thread, error: te } = await admin
      .from('threads')
      .insert({ member_id: memberId })
      .select('id')
      .single()

    if (te || !thread) {
      return NextResponse.json({ error: te?.message ?? 'Failed to create thread' }, { status: 500 })
    }

    await admin.from('thread_participants').insert([
      { thread_id: thread.id, user_id: memberId, role: 'member' },
      { thread_id: thread.id, user_id: user.id, role: 'head_coach' },
    ])

    return NextResponse.json({ thread })
  }

  // ── Assign member to coach ────────────────────────────────────────────────
  if (action === 'assign') {
    const { memberId, coachId } = body
    if (!memberId || !coachId) return NextResponse.json({ error: 'memberId and coachId required' }, { status: 400 })

    const { error } = await admin
      .from('coach_assignments')
      .upsert({ member_id: memberId, coach_id: coachId }, { onConflict: 'member_id' })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  // ── Broadcast message to all threads ─────────────────────────────────────
  if (action === 'broadcast') {
    const { threadIds, body: msgBody } = body
    if (!threadIds?.length || !msgBody) return NextResponse.json({ error: 'threadIds and body required' }, { status: 400 })

    const messages = threadIds.map((tid: string) => ({
      thread_id: tid,
      author_id: user.id,
      body: msgBody,
    }))

    const { error } = await admin.from('messages').insert(messages)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
