import { NextRequest, NextResponse } from 'next/server'
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

  // Write to DB first
  await Promise.all([
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

  // Call ManyChat with 8s timeout — await so we can return the result for debugging
  let mcStatus = 0
  let mcBody = ''
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    const mcRes = await fetch('https://api.manychat.com/fb/sending/sendContent', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${process.env.MANYCHAT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriber_id: Number(conversationId),
        messaging_type: 'MESSAGE_TAG',
        tag: 'HUMAN_AGENT',
        data: {
          version: 'v2',
          content: {
            messages: [{ type: 'text', text: message }],
            actions: [],
            quick_replies: [],
          },
        },
      }),
    })
    clearTimeout(timer)
    mcStatus = mcRes.status
    mcBody = await mcRes.text()
  } catch (err) {
    mcBody = err instanceof Error ? err.message : String(err)
  }

  console.log('[ig/send] ManyChat result:', mcStatus, mcBody)

  // Always return ok (message already saved to DB), but include mc result for debugging
  return NextResponse.json({ ok: true, mcStatus, mcBody })
}
