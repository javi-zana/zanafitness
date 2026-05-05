import { NextRequest, NextResponse } from 'next/server'
import { waitUntil } from '@vercel/functions'
import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export const maxDuration = 30

const ADMIN_EMAIL = 'me@javilorenzana.com'

function adminDb() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { conversationId, message } = await req.json()
  if (!conversationId || !message?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const db = adminDb()
  const now = new Date().toISOString()

  // Write to DB immediately — source of truth for the UI
  const [msgResult, convResult] = await Promise.all([
    db.from('ig_messages').insert({
      conversation_id: conversationId,
      direction: 'outbound',
      body: message,
      sent_at: now,
    }),
    db.from('ig_conversations').update({
      last_message_body: message,
      last_message_at: now,
      unread: false,
    }).eq('id', conversationId),
    db.from('ig_conversations').update({ bucket: 'interviewing' })
      .eq('id', conversationId).eq('bucket', 'new'),
  ])

  if (msgResult.error || convResult.error) {
    const err = msgResult.error ?? convResult.error
    console.error('[ig/send] DB error:', err)
    return NextResponse.json({ error: err!.message }, { status: 500 })
  }

  // waitUntil keeps the Lambda alive after the response is sent
  // so the ManyChat call actually completes
  waitUntil(
    fetch('https://api.manychat.com/fb/sending/sendContent', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MANYCHAT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriber_id: Number(conversationId),
        data: {
          version: 'v2',
          content: {
            messages: [{ type: 'text', text: message }],
            actions: [],
            quick_replies: [],
          },
        },
      }),
    }).then(async res => {
      const text = await res.text()
      console.log('[ig/send] ManyChat:', res.status, text)
    }).catch(err => {
      console.error('[ig/send] ManyChat error:', err.message)
    })
  )

  return NextResponse.json({ ok: true })
}
