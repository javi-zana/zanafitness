import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { FROM_EMAIL } from '@/lib/acceptance-email'

// Coach notification recipients (Javi + MJ). Comma-separated env override.
function coachEmails(): string[] {
  return (process.env.COACH_NOTIFY_EMAILS ?? 'me@javilorenzana.com')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)
}

function esc(v: unknown): string {
  return String(v ?? '—').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

async function notifyCoaches(body: Record<string, unknown>) {
  const ig = String(body.instagram ?? '').trim().replace(/^@/, '')
  const rows: Array<[string, unknown]> = [
    ['Name', body.firstName],
    ['Instagram', ig ? `@${ig}` : null],
    ['Age', body.age],
    ['Location', body.location],
    ['Work', body.work],
    ['Mirror goal', body.mirrorGoal],
    ['Investment fit', body.investmentFit],
    ['Commitment', body.commitment],
    ['Why now', body.whyNow],
  ]
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;">
      <h2 style="font-size:16px;color:#111;">New application: ${esc(body.firstName)}</h2>
      <table cellpadding="6" cellspacing="0" style="font-size:13px;color:#333;">
        ${rows
          .filter(([, v]) => v !== null && v !== undefined && v !== '')
          .map(([k, v]) => `<tr><td style="color:#888;vertical-align:top;white-space:nowrap;">${k}</td><td>${esc(v)}</td></tr>`)
          .join('')}
      </table>
      <p style="margin-top:16px;">
        <a href="https://ai.zanafitness.com/applications" style="color:#3a7a0a;font-weight:700;">Review in the inbox →</a>
        ${ig ? ` &nbsp;·&nbsp; <a href="https://instagram.com/${esc(ig)}" style="color:#3a7a0a;">IG profile →</a>` : ''}
      </p>
    </div>`
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: coachEmails(),
    subject: `New application: ${String(body.firstName ?? 'Unknown')}`,
    html,
  })
  if (error) console.error('[apply] coach notification error:', error)
}

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
      training_looks: body.trainingLooks ?? null,
      coach_history: body.coachHistory ?? null,
      commitment: typeof body.commitment === 'number' ? body.commitment : null,
      investment_fit: body.investmentFit ?? null,
      investment_why: body.investmentWhy ?? null,
      why_now: body.whyNow ?? null,
    })
    .then(({ error }) => {
      if (error) console.error('[apply] Supabase insert error:', error.message)
    })

  // Notify Javi + MJ immediately — awaited so serverless doesn't kill the send
  await notifyCoaches(body).catch((err) => console.error('[apply] notify threw:', err))

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
