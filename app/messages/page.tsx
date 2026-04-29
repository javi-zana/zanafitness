import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import MessagesClient from './MessagesClient'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, role')
    .eq('id', user.id)
    .single()

  const { data: thread } = await supabase
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
    supabase
      .from('messages')
      .select('id, author_id, body, created_at, message_attachments(id, storage_path, kind)')
      .eq('thread_id', thread.id)
      .order('created_at', { ascending: true })
      .limit(100),
    supabase
      .from('message_reads')
      .select('user_id, last_read_at')
      .eq('thread_id', thread.id),
  ])

  // Mark as read on page load (server-side)
  await supabase
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
