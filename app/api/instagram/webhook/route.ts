import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// Webhook verification handshake
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get('hub.mode')
  const token = req.nextUrl.searchParams.get('hub.verify_token')
  const challenge = req.nextUrl.searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 })
  }
  return new Response('Forbidden', { status: 403 })
}

// Incoming messages from Instagram
export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  // Validate Meta signature
  const sig = req.headers.get('x-hub-signature-256')
  if (process.env.META_APP_SECRET && sig) {
    const expected = 'sha256=' + crypto
      .createHmac('sha256', process.env.META_APP_SECRET)
      .update(rawBody)
      .digest('hex')
    if (sig !== expected) {
      console.error('[ig/webhook] Bad signature')
      return new Response('Invalid signature', { status: 401 })
    }
  }

  let body: Record<string, unknown>
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ ok: true })
  }

  console.log('[ig/webhook] POST object:', body.object, 'raw:', rawBody.slice(0, 500))

  if (body.object !== 'instagram' && body.object !== 'page') return NextResponse.json({ ok: true })

  const db = adminDb()

  for (const entry of (body.entry as unknown[]) ?? []) {
    const e = entry as { messaging?: unknown[] }
    for (const event of e.messaging ?? []) {
      const ev = event as {
        sender: { id: string }
        recipient: { id: string }
        timestamp: number
        message?: { mid: string; text?: string; is_echo?: boolean }
      }

      // Skip echoes (messages Javi sent) and non-text messages
      if (!ev.message?.text || ev.message.is_echo) continue

      const senderId = ev.sender.id
      const messageId = ev.message.mid
      const text = ev.message.text
      const sentAt = new Date(ev.timestamp).toISOString()

      // Upsert conversation (create if new, update last message if existing)
      await db.from('ig_conversations').upsert({
        id: senderId,
        last_message_body: text,
        last_message_at: sentAt,
        status: 'open',
      }, { onConflict: 'id' })

      // Insert message (ignore duplicate if already stored)
      await db.from('ig_messages').upsert({
        id: messageId,
        conversation_id: senderId,
        direction: 'inbound',
        body: text,
        sent_at: sentAt,
      }, { onConflict: 'id', ignoreDuplicates: true })
    }
  }

  return NextResponse.json({ ok: true })
}
