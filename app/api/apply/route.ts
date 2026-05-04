import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.GOOGLE_SHEET_APPLY_WEBHOOK

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Save to Supabase (non-blocking — don't fail the submission if this errors)
  admin()
    .from('applications')
    .insert({
      first_name: body.firstName ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,
      instagram: body.instagram ?? null,
      age: body.age ?? null,
      location: body.location ?? null,
      work: body.work ?? null,
      mirror_goal: body.mirrorGoal ?? null,
      what_stopped: body.whatStopped ?? null,
      training_history: body.trainingHistory ?? null,
      commitment: typeof body.commitment === 'number' ? body.commitment : null,
      investment_fit: body.investmentFit ?? null,
      why_now: body.whyNow ?? null,
    })
    .then(({ error }) => {
      if (error) console.error('[apply] Supabase insert error:', error.message)
    })

  if (!webhookUrl) {
    // Google Sheet not configured — but Supabase save already queued above
    console.warn('[apply] GOOGLE_SHEET_APPLY_WEBHOOK not set — skipping sheet write')
    return NextResponse.json({ success: true })
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      redirect: 'follow',
    })

    const text = await res.text()
    console.log('[apply] GAS status:', res.status, '| body:', text.slice(0, 500))

    try {
      const json = JSON.parse(text)
      if (json.success === true) return NextResponse.json({ success: true })
      console.error('[apply] GAS did not return success:', json)
      return NextResponse.json({ error: 'Sheet write failed' }, { status: 502 })
    } catch {
      console.error('[apply] GAS returned non-JSON:', text.slice(0, 300))
      return NextResponse.json({ error: 'Sheet write failed' }, { status: 502 })
    }
  } catch (err) {
    console.error('[apply] fetch threw:', err)
    return NextResponse.json({ error: 'Could not reach Google Sheet' }, { status: 502 })
  }
}
