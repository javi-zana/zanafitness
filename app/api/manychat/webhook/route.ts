import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: true })
  }

  console.log('[manychat/webhook] received:', JSON.stringify(body).slice(0, 500))

  // Support both "Full Contact Data" format and individual field format
  const subscriberId = String(body.id ?? body.subscriber_id ?? '').trim()
  const displayName = (body.first_name as string | undefined) ?? null
  const profilePic = (body.profile_pic as string | undefined) ?? null
  const message = String(body.last_input_text ?? body.message ?? '').trim()
  const igUsername = (body.ig_username as string | undefined) ?? null
  const sentAt = new Date().toISOString()

  if (!subscriberId) return NextResponse.json({ ok: true })

  const db = adminDb()

  await db.from('ig_conversations').upsert({
    id: subscriberId,
    display_name: displayName,
    profile_pic_url: profilePic,
    ig_username: igUsername,
    last_message_body: message || null,
    last_message_at: sentAt,
    status: 'open',
  }, { onConflict: 'id' })

  if (message) {
    await db.from('ig_messages').insert({
      conversation_id: subscriberId,
      direction: 'inbound',
      body: message,
      sent_at: sentAt,
    })
  }

  return NextResponse.json({ ok: true })
}
