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

  const subscriberId = String(body.subscriber_id ?? '').trim()
  const message = String(body.message ?? '').trim()

  if (!subscriberId || !message) return NextResponse.json({ ok: true })

  const displayName = (body.first_name as string | undefined) ?? null
  const profilePic = (body.profile_pic as string | undefined) ?? null
  const sentAt = new Date().toISOString()

  const db = adminDb()

  await db.from('ig_conversations').upsert({
    id: subscriberId,
    display_name: displayName,
    profile_pic_url: profilePic,
    last_message_body: message,
    last_message_at: sentAt,
    status: 'open',
  }, { onConflict: 'id' })

  await db.from('ig_messages').insert({
    conversation_id: subscriberId,
    direction: 'inbound',
    body: message,
    sent_at: sentAt,
  })

  return NextResponse.json({ ok: true })
}
