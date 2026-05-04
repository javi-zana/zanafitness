import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/utils/supabase/server'

const ADMIN_EMAIL = 'me@javilorenzana.com'
const FROM_EMAIL = 'Javier Lorenzana <javi@zanafitness.com>'
const CALENDLY_URL = 'https://calendly.com/javilorenzana/30min'

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
      <tr>
        <td style="padding-bottom:32px;">
          <table cellpadding="0" cellspacing="0"><tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;letter-spacing:4px;color:#3a7a0a;text-transform:uppercase;">ZANA</td></tr></table>
        </td>
      </tr>
      <tr>
        <td style="background-color:#ffffff;border:1px solid #daecc7;border-radius:20px;padding:48px 44px;">
          <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;"><tr><td style="background-color:#b0e455;border-radius:100px;width:36px;height:4px;font-size:0;line-height:0;">&nbsp;</td></tr></table>
          <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;color:#111111;line-height:1.3;">Hey ${firstName} — let's talk.</p>
          <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;letter-spacing:0.5px;color:#3a7a0a;text-transform:uppercase;">You're in.</p>
          <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.75;color:#444444;">Went through your application. I think we'd work well together.</p>
          <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.75;color:#444444;">Your goal is clear. You know what's been in the way. And you're ready to actually do something about it — that's exactly who I build this for.</p>
          <p style="margin:0 0 36px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.75;color:#444444;">Next step is a <strong style="color:#111111;">30-minute call</strong>. No pitch, no pressure — I just want to hear more about where you're at and make sure the program actually makes sense for you before we commit to anything.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:40px;"><tr><td><a href="${CALENDLY_URL}" style="display:inline-block;background-color:#b0e455;color:#1a3a06;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.5px;text-decoration:none;padding:15px 32px;border-radius:100px;">Book Your Call →</a></td></tr></table>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;"><tr><td style="height:1px;background-color:#eef4e8;font-size:0;line-height:0;">&nbsp;</td></tr></table>
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#999999;">Talk soon,<br /><span style="color:#333333;font-weight:700;">Javi</span></p>
        </td>
      </tr>
      <tr><td style="padding-top:28px;" align="center"><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1px;color:#aaaaaa;text-transform:uppercase;">© 2026 Zana Fitness &nbsp;·&nbsp;<a href="https://zanafitness.com/privacy" style="color:#aaaaaa;text-decoration:none;">Privacy</a></p></td></tr>
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
<body style="margin:0;padding:0;background-color:#f5f5f3;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f3;">
  <tr>
    <td align="center" style="padding:48px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
      <tr>
        <td style="padding-bottom:32px;">
          <table cellpadding="0" cellspacing="0"><tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;letter-spacing:4px;color:#3a7a0a;text-transform:uppercase;">ZANA</td></tr></table>
        </td>
      </tr>
      <tr>
        <td style="background-color:#ffffff;border:1px solid #e5e5e3;border-radius:20px;padding:48px 44px;">
          <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;"><tr><td style="background-color:#d4d4d0;border-radius:100px;width:36px;height:4px;font-size:0;line-height:0;">&nbsp;</td></tr></table>
          <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;color:#111111;line-height:1.3;">Hey ${firstName}.</p>
          <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.75;color:#444444;">Thanks for taking the time to fill out the application — I read through it in full.</p>
          <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.75;color:#444444;">After going through it, I don't think this program is the right fit for you right now. That's not a knock on your goals or where you're at — it's more about my coaching style and the specific profile of person this tends to work best for.</p>
          <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.75;color:#444444;">I'll hold onto your info. If I open something up that feels like a better match, or if I think the timing has changed, I'll reach out.</p>
          <p style="margin:0 0 36px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.75;color:#444444;">Either way — thank you for applying. It means a lot that you took the time.</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;"><tr><td style="height:1px;background-color:#eeeeec;font-size:0;line-height:0;">&nbsp;</td></tr></table>
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#999999;">All the best,<br /><span style="color:#333333;font-weight:700;">Javi</span></p>
        </td>
      </tr>
      <tr><td style="padding-top:28px;" align="center"><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1px;color:#aaaaaa;text-transform:uppercase;">© 2026 Zana Fitness &nbsp;·&nbsp;<a href="https://zanafitness.com/privacy" style="color:#aaaaaa;text-decoration:none;">Privacy</a></p></td></tr>
    </table>
    </td>
  </tr>
</table>
</body>
</html>`
}

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const results: Record<string, string> = {}

  const { error: e1 } = await resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: '[TEST] Accept email — Zana',
    html: acceptEmailHtml('Javi'),
  })
  results.accept = e1 ? `FAILED: ${e1.message}` : 'sent'

  const { error: e2 } = await resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: '[TEST] Decline email — Zana',
    html: declineEmailHtml('Javi'),
  })
  results.decline = e2 ? `FAILED: ${e2.message}` : 'sent'

  return NextResponse.json({ results })
}
