import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Cal.com webhook → auto-move an accepted application to "Call Booked"
// when the applicant books their intro call.
//
// Setup in Cal.com: Settings → Developer → Webhooks → New
//   • Subscriber URL: https://zanafitness.com/api/cal-webhook
//   • Event: "Booking Created"
//   • Secret: set the same value as CAL_WEBHOOK_SECRET in the env

function admin() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// Cal.com signs the raw request body with HMAC-SHA256 (hex) using the webhook
// secret, sent in the X-Cal-Signature-256 header.
function verifySignature(rawBody: string, header: string | null): boolean {
  const secret = process.env.CAL_WEBHOOK_SECRET
  if (!secret) {
    // No secret configured — skip verification (log so it's noticed).
    console.warn('[cal-webhook] CAL_WEBHOOK_SECRET not set — skipping signature check')
    return true
  }
  if (!header) return false
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  // timingSafeEqual throws if lengths differ, so guard first
  if (header.length !== expected.length) return false
  return crypto.timingSafeEqual(Buffer.from(header), Buffer.from(expected))
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  if (!verifySignature(rawBody, req.headers.get('x-cal-signature-256'))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let body: any
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (body?.triggerEvent !== 'BOOKING_CREATED') {
    // Not a booking we care about — ack so Cal.com doesn't retry.
    return NextResponse.json({ ignored: body?.triggerEvent ?? 'unknown' })
  }

  const payload = body.payload ?? {}
  const email: string | undefined =
    payload.attendees?.[0]?.email ?? payload.responses?.email?.value

  if (!email) {
    console.warn('[cal-webhook] booking with no attendee email', payload)
    return NextResponse.json({ ignored: 'no-email' })
  }

  const db = admin()

  // Match the most recent application for this email that's awaiting a booking.
  const { data: app, error: fetchErr } = await db
    .from('applications')
    .select('id, status')
    .ilike('email', email)
    .eq('status', 'accepted')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (fetchErr) {
    console.error('[cal-webhook] DB lookup error:', fetchErr)
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  if (!app) {
    // Booked by someone not in the "Email Sent" stage — nothing to move.
    console.log(`[cal-webhook] no accepted application for ${email}`)
    return NextResponse.json({ matched: false })
  }

  const { error: updateErr } = await db
    .from('applications')
    .update({ status: 'call_booked', responded_at: new Date().toISOString() })
    .eq('id', app.id)

  if (updateErr) {
    console.error('[cal-webhook] DB update error:', updateErr)
    return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
  }

  console.log(`[cal-webhook] moved application ${app.id} (${email}) → call_booked`)
  return NextResponse.json({ matched: true, applicationId: app.id })
}
