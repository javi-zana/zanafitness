import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import MessagesClient from './MessagesClient'

function adminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = adminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('first_name, role, avatar_url, avatar_color')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'head_coach' || profile?.role === 'coach') redirect('/coach')

  const isAdmin = profile?.role === 'head_coach' && user.email === 'me@javilorenzana.com'

  const { data: thread } = await admin
    .from('threads')
    .select('id')
    .eq('member_id', user.id)
    .maybeSingle()

  const userProfile = {
    firstName: profile?.first_name ?? null,
    avatarUrl: profile?.avatar_url ?? null,
    avatarColor: profile?.avatar_color ?? '#b0e455',
  }

  if (!thread) {
    return (
      <MessagesClient
        userId={user.id}
        threadId={null}
        initialMessages={[]}
        otherReads={[]}
        authorProfiles={{}}
        userProfile={userProfile}
        isAdmin={isAdmin}
      />
    )
  }

  const [{ data: messages }, { data: reads }] = await Promise.all([
    admin
      .from('messages')
      .select('id, author_id, body, created_at, message_attachments(id, storage_path, kind)')
      .eq('thread_id', thread.id)
      .order('created_at', { ascending: true })
      .limit(100),
    admin
      .from('message_reads')
      .select('user_id, last_read_at')
      .eq('thread_id', thread.id),
  ])

  // Fetch profiles for all unique message authors
  const authorIds = Array.from(new Set((messages ?? []).map(m => m.author_id)))
  const { data: authorRows } = authorIds.length > 0
    ? await admin
        .from('profiles')
        .select('id, first_name, avatar_url, avatar_color')
        .in('id', authorIds)
    : { data: [] }

  const authorProfiles: Record<string, { firstName: string | null; avatarUrl: string | null; avatarColor: string }> = {}
  for (const row of authorRows ?? []) {
    authorProfiles[row.id] = {
      firstName: row.first_name ?? null,
      avatarUrl: row.avatar_url ?? null,
      avatarColor: row.avatar_color ?? '#b0e455',
    }
  }

  await admin
    .from('message_reads')
    .upsert({ thread_id: thread.id, user_id: user.id, last_read_at: new Date().toISOString() })

  const otherReads = (reads ?? []).filter(r => r.user_id !== user.id)

  return (
    <MessagesClient
      userId={user.id}
      threadId={thread.id}
      initialMessages={messages ?? []}
      otherReads={otherReads}
      authorProfiles={authorProfiles}
      userProfile={userProfile}
      isAdmin={isAdmin}
    />
  )
}
