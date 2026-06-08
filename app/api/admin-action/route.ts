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

  // ── Assign member to coach ────────────────────────────────────────────────
  // Replaces any previously-assigned coach.
  if (action === 'assign') {
    const { memberId, coachId } = body
    if (!memberId || !coachId) return NextResponse.json({ error: 'memberId and coachId required' }, { status: 400 })

    // Replace any existing assignment for this member (composite PK on
    // coach_assignments means upsert with `onConflict: 'member_id'` doesn't
    // work cleanly — delete + insert is the safer pattern).
    await admin.from('coach_assignments').delete().eq('member_id', memberId)
    const { error: assignErr } = await admin
      .from('coach_assignments')
      .insert({ member_id: memberId, coach_id: coachId })
    if (assignErr) return NextResponse.json({ error: assignErr.message }, { status: 500 })

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
    const buckets = ['progress-photos', 'profile-photos', 'stat-photos']
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
