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
    .select('first_name, role')
    .eq('id', user.id)
    .single()

  const { data: thread } = await admin
    .from('threads')
    .select('id')
    .eq('member_id', user.id)
    .maybeSingle()

  if (!thread) {
    return (
      <MessagesClient
        userId={user.id}
        threadId={null}
        initialMessages={[]}
        otherReads={[]}
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

  // Mark as read on page load (server-side)
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
    />
  )
}
