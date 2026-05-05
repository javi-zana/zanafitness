import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const ADMIN_EMAIL = 'me@javilorenzana.com'
const FROM_EMAIL = 'Javier Lorenzana <javi@zanafitness.com>'
const CALENDLY_URL = 'https://calendly.com/me-javilorenzana/30min?month=2026-05'

function admin() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function logoHtml() {
  return `<table cellpadding="0" cellspacing="0">
    <tr>
      <td style="background-color:#b0e455;border-radius:8px;width:36px;height:36px;text-align:center;vertical-align:middle;">
        <span style="font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:900;color:#0b1509;line-height:36px;display:block;">Z</span>
      </td>
      <td style="padding-left:10px;vertical-align:middle;">
        <span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;letter-spacing:4px;color:#3a7a0a;text-transform:uppercase;">ZANA</span>
      </td>
    </tr>
  </table>`
}

function acceptEmailHtml(firstName: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Let's talk — Zana</title>
</head>
<body style="margin:0;padding:0;background-color:#f2f7ed;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f2f7ed;">
  <tr>
    <td align="center" style="padding:48px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

      <!-- LOGO -->
      <tr>
        <td style="padding-bottom:32px;">${logoHtml()}</td>
      </tr>

      <!-- CARD -->
      <tr>
        <td style="background-color:#ffffff;border:1px solid #daecc7;border-radius:20px;padding:48px 44px;">

          <!-- SCARCITY BADGE -->
          <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td style="background-color:#f2f7ed;border:1px solid #c5e49a;border-radius:100px;padding:6px 14px;">
                <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:1px;color:#3a7a0a;text-transform:uppercase;">1-on-1 · Limited Spots</span>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;color:#111111;line-height:1.3;">
            Hey ${firstName} — you caught my attention.
          </p>

          <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.5px;color:#3a7a0a;text-transform:uppercase;">
            I'd like to connect.
          </p>

          <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.75;color:#444444;">
            Went through your application. What you wrote stood out.
          </p>

          <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.75;color:#444444;">
            I keep my roster deliberately small — this is fully one-on-one coaching, not a group program or a template. Every person I work with gets my full attention, and I only bring someone on when I genuinely believe I can help them get there.
          </p>

          <p style="margin:0 0 36px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.75;color:#444444;">
            Next step is a <strong style="color:#111111;">30-minute call</strong> — no pitch, no pressure. Just a real conversation to make sure this is the right fit for both of us before we commit to anything.
          </p>

          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:40px;">
            <tr>
              <td>
                <a href="${CALENDLY_URL}"
                  style="display:inline-block;background-color:#b0e455;color:#1a3a06;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.5px;text-decoration:none;padding:15px 32px;border-radius:100px;">
                  Book Your Call →
                </a>
              </td>
            </tr>
          </table>

          <!-- DIVIDER -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr><td style="height:1px;background-color:#eef4e8;font-size:0;line-height:0;">&nbsp;</td></tr>
          </table>

          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#999999;">
            Talk soon,<br />
            <span style="color:#333333;font-weight:700;">Javi</span>
          </p>

        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="padding-top:28px;" align="center">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1px;color:#aaaaaa;text-transform:uppercase;">
            © 2026 Zana Fitness &nbsp;·&nbsp;
            <a href="https://zanafitness.com/privacy" style="color:#aaaaaa;text-decoration:none;">Privacy</a>
          </p>
        </td>
      </tr>

    </table>
    </td>
  </tr>
</table>
</body>
</html>`
}

function declineEmailHtml(firstName: string, personalNote?: string) {
  const noteHtml = personalNote?.trim()
    ? `<p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.75;color:#333333;font-style:italic;border-left:3px solid #d4d4d0;padding-left:16px;">${personalNote.trim()}</p>`
    : ''
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Zana Application</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f3;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f3;">
  <tr>
    <td align="center" style="padding:48px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

      <!-- LOGO -->
      <tr>
        <td style="padding-bottom:32px;">${logoHtml()}</td>
      </tr>

      <!-- CARD -->
      <tr>
        <td style="background-color:#ffffff;border:1px solid #e5e5e3;border-radius:20px;padding:48px 44px;">

          <!-- ACCENT BAR -->
          <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr>
              <td style="background-color:#d4d4d0;border-radius:100px;width:36px;height:4px;font-size:0;line-height:0;">&nbsp;</td>
            </tr>
          </table>

          <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;color:#111111;line-height:1.3;">
            Hey ${firstName}.
          </p>

          ${noteHtml}

          <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.75;color:#444444;">
            Thank you for taking the time — I genuinely read every application, and yours was no different.
          </p>

          <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.75;color:#444444;">
            After sitting with it, I don't think the timing is right for us to work together. That's not a reflection of your goals or your drive — it's about fit, and fit matters a lot when coaching is this personal.
          </p>

          <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.75;color:#444444;">
            I'll hold onto your info. Things change — programs evolve, spots open up — and if I ever feel like there's a real opening for you, I'll reach out personally.
          </p>

          <p style="margin:0 0 36px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.75;color:#444444;">
            Wishing you real progress on this, wherever it comes from. The fact that you applied says a lot. Keep going. 💪
          </p>

          <!-- DIVIDER -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr><td style="height:1px;background-color:#eeeeec;font-size:0;line-height:0;">&nbsp;</td></tr>
          </table>

          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#999999;">
            All the best,<br />
            <span style="color:#333333;font-weight:700;">Javi</span>
          </p>

        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="padding-top:28px;" align="center">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1px;color:#aaaaaa;text-transform:uppercase;">
            © 2026 Zana Fitness &nbsp;·&nbsp;
            <a href="https://zanafitness.com/privacy" style="color:#aaaaaa;text-decoration:none;">Privacy</a>
          </p>
        </td>
      </tr>

    </table>
    </td>
  </tr>
</table>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { applicationId, action, personalNote } = await req.json()
  if (!applicationId || !['accept', 'decline'].includes(action)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const db = admin()

  const { data: app, error: fetchErr } = await db
    .from('applications')
    .select('id, first_name, email, status')
    .eq('id', applicationId)
    .single()

  if (fetchErr || !app) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  if (app.status !== 'pending') {
    return NextResponse.json({ error: 'Already responded' }, { status: 409 })
  }

  await db.from('applications').update({
    status: action === 'accept' ? 'call_booked' : 'closed',
    responded_at: new Date().toISOString(),
  }).eq('id', applicationId)

  const resend = new Resend(process.env.RESEND_API_KEY)
  const firstName = (app.first_name as string | null) ?? 'there'

  const { error: emailErr } = await resend.emails.send({
    from: FROM_EMAIL,
    to: app.email as string,
    subject: action === 'accept'
      ? "Let's talk — here's the link to book your call"
      : 'Your Zana Application',
    html: action === 'accept' ? acceptEmailHtml(firstName) : declineEmailHtml(firstName, personalNote),
  })

  if (emailErr) {
    console.error('[application-action] Resend error:', emailErr)
  }

  return NextResponse.json({ success: true, action, emailSent: !emailErr })
}
