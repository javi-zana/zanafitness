import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

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

  // Send via Instagram Graph API
  const igRes = await fetch(
    `https://graph.facebook.com/v19.0/me/messages?access_token=${process.env.INSTAGRAM_PAGE_ACCESS_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: conversationId },
        message: { text: message },
        messaging_type: 'RESPONSE',
      }),
    }
  )

  const igJson = await igRes.json()
  if (!igRes.ok) {
    console.error('[ig/send] Graph API error:', igJson)
    return NextResponse.json({ error: igJson.error?.message ?? 'Send failed' }, { status: 502 })
  }

  const db = adminDb()
  const now = new Date().toISOString()
  const messageId = igJson.message_id ?? `local-${Date.now()}`

  await Promise.all([
    db.from('ig_messages').upsert({
      id: messageId,
      conversation_id: conversationId,
      direction: 'outbound',
      body: message,
      sent_at: now,
    }, { onConflict: 'id', ignoreDuplicates: true }),

    db.from('ig_conversations').update({
      last_message_body: message,
      last_message_at: now,
    }).eq('id', conversationId),
  ])

  return NextResponse.json({ ok: true, messageId })
}
