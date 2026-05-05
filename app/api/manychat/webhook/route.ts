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

  console.log('[manychat/webhook] full body:', JSON.stringify(body))

  const subscriberId = String(body.id ?? body.subscriber_id ?? '').trim()
  const displayName = (body.first_name as string | undefined) ?? null
  const profilePic = (body.profile_pic as string | undefined) ?? null
  const message = String(body.last_input_text ?? body.message ?? '').trim()
  const igUsername = (body.ig_username as string | undefined) ?? null
  const direction = (body.direction as string | undefined) === 'outbound' ? 'outbound' : 'inbound'
  const sentAt = new Date().toISOString()

  console.log('[manychat/webhook] parsed:', { subscriberId, displayName, message, igUsername, direction })

  if (!subscriberId) {
    console.log('[manychat/webhook] no subscriberId, skipping')
    return NextResponse.json({ ok: true })
  }

  const db = adminDb()

  // Only upsert conversation metadata on inbound messages
  if (direction === 'inbound') {
    const { error: upsertError } = await db.from('ig_conversations').upsert({
      id: subscriberId,
      display_name: displayName,
      profile_pic_url: profilePic,
      ig_username: igUsername,
      last_message_body: message || null,
      last_message_at: sentAt,
      status: 'open',
    }, { onConflict: 'id' })

    if (upsertError) {
      console.error('[manychat/webhook] upsert error:', JSON.stringify(upsertError))
      return NextResponse.json({ error: upsertError.message }, { status: 500 })
    }
  }

  if (message) {
    const { error: insertError } = await db.from('ig_messages').insert({
      conversation_id: subscriberId,
      direction,
      body: message,
      sent_at: sentAt,
    })
    if (insertError) {
      console.error('[manychat/webhook] insert error:', JSON.stringify(insertError))
    }
  }

  console.log('[manychat/webhook] stored:', direction, subscriberId)
  return NextResponse.json({ ok: true })
}
