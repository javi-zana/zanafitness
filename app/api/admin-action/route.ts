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

  // ── Delete member (auth user + profile + all related data) ───────────────
  if (action === 'delete_member') {
    const { memberId } = body
    if (!memberId) return NextResponse.json({ error: 'memberId required' }, { status: 400 })
    if (memberId === user.id) {
      return NextResponse.json({ error: "You can't delete your own account." }, { status: 400 })
    }

    // Confirm target is a member (don't allow deleting coaches via this path)
    const { data: target } = await admin.from('profiles').select('role, email').eq('id', memberId).single()
    if (!target) return NextResponse.json({ error: 'Member not found.' }, { status: 404 })
    if (target.role !== 'member') {
      return NextResponse.json({ error: 'Refusing to delete non-member account.' }, { status: 400 })
    }

    // Best-effort: clean up storage files. Each bucket stores files under {user_id}/...
    const buckets = ['progress-photos', 'profile-photos', 'stat-photos', 'message-attachments']
    for (const bucket of buckets) {
      const { data: files } = await admin.storage.from(bucket).list(memberId)
      if (files && files.length > 0) {
        await admin.storage.from(bucket).remove(files.map(f => `${memberId}/${f.name}`))
      }
    }

    // Delete auth user — cascades to profiles row → cascades to all related rows via FK
    const { error: delErr } = await admin.auth.admin.deleteUser(memberId)
    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 })

    return NextResponse.json({ ok: true, deletedEmail: target.email })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
