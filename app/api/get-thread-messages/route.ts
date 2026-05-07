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

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const threadId = req.nextUrl.searchParams.get('thread_id')
  if (!threadId) return NextResponse.json({ error: 'thread_id required' }, { status: 400 })

  const admin = adminClient()

  // Verify the thread exists
  const { data: thread } = await admin
    .from('threads')
    .select('id, member_id')
    .eq('id', threadId)
    .single()

  if (!thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 })

  // Verify sender has access: direct participant, assigned coach, or head_coach
  const [{ data: participant }, { data: assignment }, { data: profile }] = await Promise.all([
    admin.from('thread_participants').select('user_id').eq('thread_id', threadId).eq('user_id', user.id).maybeSingle(),
    admin.from('coach_assignments').select('coach_id').eq('member_id', thread.member_id).eq('coach_id', user.id).maybeSingle(),
    admin.from('profiles').select('role').eq('id', user.id).maybeSingle(),
  ])

  const hasAccess = participant || assignment || profile?.role === 'head_coach'
  if (!hasAccess) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const since = req.nextUrl.searchParams.get('since')

  let query = admin
    .from('messages')
    .select('id, author_id, body, created_at, message_attachments(id, storage_path, kind)')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })

  if (since) {
    query = query.gt('created_at', since)
  } else {
    query = query.limit(100)
  }

  const { data: messages, error } = await query

  if (error) {
    console.error('get-thread-messages error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ messages: messages ?? [] })
}
