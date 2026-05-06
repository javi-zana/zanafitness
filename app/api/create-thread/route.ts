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

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = adminClient()
  const { data: myProfile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (!myProfile || !['coach', 'head_coach'].includes(myProfile.role ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { type, participant_ids, title } = await req.json()
  if (!type || !Array.isArray(participant_ids) || participant_ids.length === 0) {
    return NextResponse.json({ error: 'type and participant_ids required' }, { status: 400 })
  }

  const allParticipants = Array.from(new Set([user.id, ...participant_ids]))

  // For DMs: check if thread already exists between the two users
  if (type === 'dm') {
    if (allParticipants.length !== 2) {
      return NextResponse.json({ error: 'DM requires exactly 2 participants' }, { status: 400 })
    }
    const otherId = participant_ids[0]

    const { data: myRows } = await admin
      .from('thread_participants')
      .select('thread_id')
      .eq('user_id', user.id)

    const myThreadIds = (myRows ?? []).map(r => r.thread_id as string)

    if (myThreadIds.length > 0) {
      const { data: dmThreads } = await admin
        .from('threads')
        .select('id')
        .in('id', myThreadIds)
        .eq('thread_type', 'dm')

      const dmIds = (dmThreads ?? []).map(t => t.id as string)
      if (dmIds.length > 0) {
        const { data: shared } = await admin
          .from('thread_participants')
          .select('thread_id')
          .in('thread_id', dmIds)
          .eq('user_id', otherId)
          .limit(1)

        if (shared && shared.length > 0) {
          return NextResponse.json({ thread_id: shared[0].thread_id, existing: true })
        }
      }
    }
  }

  const { data: thread, error } = await admin
    .from('threads')
    .insert({
      is_group: type !== 'dm',
      title: title ?? null,
      thread_type: type,
      created_by: user.id,
    })
    .select('id')
    .single()

  if (error || !thread) {
    return NextResponse.json({ error: error?.message ?? 'Failed to create thread' }, { status: 500 })
  }

  const { data: participantProfiles } = await admin
    .from('profiles')
    .select('id, role')
    .in('id', allParticipants)

  const roleMap = Object.fromEntries((participantProfiles ?? []).map(p => [p.id as string, p.role as string]))

  await admin.from('thread_participants').insert(
    allParticipants.map(uid => ({
      thread_id: thread.id,
      user_id: uid,
      role: roleMap[uid] ?? 'member',
      added_by: user.id,
    }))
  )

  return NextResponse.json({ thread_id: thread.id, existing: false })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = adminClient()
  const { data: myProfile } = await admin.from('profiles').select('role').eq('id', user.id).single()
  if (myProfile?.role !== 'head_coach') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { thread_id, user_id } = await req.json()
  if (!thread_id || !user_id) return NextResponse.json({ error: 'thread_id and user_id required' }, { status: 400 })

  await admin.from('thread_participants').delete().eq('thread_id', thread_id).eq('user_id', user_id)
  return NextResponse.json({ success: true })
}
