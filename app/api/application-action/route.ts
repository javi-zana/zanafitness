import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const ADMIN_EMAIL = 'me@javilorenzana.com'
const FROM_EMAIL = 'Javier Lorenzana <javi@zanafitness.com>'
const CALENDLY_URL = 'https://calendly.com/javilorenzana/30min'

function admin() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function acceptEmailHtml(firstName: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Let's talk — Zana</title>
</head>
<body style="margin:0;padding:0;background-color:#0b1509;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b1509;">
  <tr>
    <td align="center" style="padding:48px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

      <!-- LOGO -->
      <tr>
        <td style="padding-bottom:40px;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;letter-spacing:3px;color:#b0e455;text-transform:uppercase;">
                ZANA
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- CARD -->
      <tr>
        <td style="background-color:#0f1a0c;border:1px solid rgba(176,228,85,0.12);border-radius:16px;padding:40px 40px;">

          <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">
            Hey ${firstName} —<br />let's talk.
          </p>

          <p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.65);">
            Went through your application. I think we'd work well together.
          </p>

          <p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.65);">
            Your goal is clear. You know what's been in the way. And you're ready to actually do something about it. That's exactly who I build this for.
          </p>

          <p style="margin:0 0 32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.65);">
            Next step is a <strong style="color:rgba(255,255,255,0.85);">30-minute call</strong>. No pitch, no pressure — I just want to hear more about where you're at and make sure the program actually makes sense for you before we commit to anything.
          </p>

          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:36px;">
            <tr>
              <td>
                <a href="${CALENDLY_URL}"
                  style="display:inline-block;background-color:#b0e455;color:#0b1509;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;text-decoration:none;padding:14px 28px;border-radius:100px;">
                  Book Your Call →
                </a>
              </td>
            </tr>
          </table>

          <!-- DIVIDER -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr><td style="height:1px;background-color:rgba(255,255,255,0.08);font-size:0;line-height:0;">&nbsp;</td></tr>
          </table>

          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.40);">
            Talk soon,<br />
            <span style="color:rgba(255,255,255,0.65);font-weight:600;">Javi</span>
          </p>

        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="padding-top:32px;" align="center">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1px;color:rgba(255,255,255,0.18);text-transform:uppercase;">
            © 2026 Zana Fitness &nbsp;·&nbsp;
            <a href="https://zanafitness.com/privacy" style="color:rgba(255,255,255,0.18);text-decoration:none;">Privacy</a>
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

function declineEmailHtml(firstName: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Zana Application</title>
</head>
<body style="margin:0;padding:0;background-color:#0b1509;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b1509;">
  <tr>
    <td align="center" style="padding:48px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

      <!-- LOGO -->
      <tr>
        <td style="padding-bottom:40px;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;letter-spacing:3px;color:rgba(255,255,255,0.35);text-transform:uppercase;">
                ZANA
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- CARD -->
      <tr>
        <td style="background-color:#0f1a0c;border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:40px 40px;">

          <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;color:#ffffff;line-height:1.3;">
            Hey ${firstName}.
          </p>

          <p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.65);">
            Thanks for taking the time to fill out the application — I read through it in full.
          </p>

          <p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.65);">
            After going through it, I don't think this program is the right fit for you right now. That's not a knock on your goals or where you're at — it's more about my coaching style and the specific profile of person this tends to work best for.
          </p>

          <p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.65);">
            I'll hold onto your info. If I open something up that feels like a better match, or if I think the timing has changed, I'll reach out.
          </p>

          <p style="margin:0 0 32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.65);">
            Either way — thank you for applying. It means a lot that you took the time.
          </p>

          <!-- DIVIDER -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr><td style="height:1px;background-color:rgba(255,255,255,0.08);font-size:0;line-height:0;">&nbsp;</td></tr>
          </table>

          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.40);">
            All the best,<br />
            <span style="color:rgba(255,255,255,0.65);font-weight:600;">Javi</span>
          </p>

        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="padding-top:32px;" align="center">
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1px;color:rgba(255,255,255,0.18);text-transform:uppercase;">
            © 2026 Zana Fitness &nbsp;·&nbsp;
            <a href="https://zanafitness.com/privacy" style="color:rgba(255,255,255,0.18);text-decoration:none;">Privacy</a>
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

  const { applicationId, action } = await req.json()
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
    status: action === 'accept' ? 'accepted' : 'declined',
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
    html: action === 'accept' ? acceptEmailHtml(firstName) : declineEmailHtml(firstName),
  })

  if (emailErr) {
    console.error('[application-action] Resend error:', emailErr)
    return NextResponse.json({ error: 'Email failed to send', detail: emailErr }, { status: 500 })
  }

  return NextResponse.json({ success: true, action })
}
