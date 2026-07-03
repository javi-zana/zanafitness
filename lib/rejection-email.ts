// Rejection email: soft no + the diet guide as a parting gift + a re-entry
// path ("fight for a spot" via IG DM). Sent from the ai-tool applications
// inbox when a pending application is rejected.

import { logoHtml } from './acceptance-email'

export const REJECT_SUBJECT = 'Your application — and my diet guide'

const GUIDE_URL = 'https://zanafitness.com/guides/zana-diet-guide.pdf'
const IG_URL = 'https://instagram.com/javi_zana'

export function rejectEmailHtml(firstName: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your application — Zana</title>
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

          <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;color:#111111;line-height:1.3;">
            Hey ${firstName},
          </p>

          <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.75;color:#444444;">
            I don't think now is the right time for us to work together. I can't accommodate everyone, and honestly — I just didn't see the commitment in this application.
          </p>

          <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.75;color:#444444;">
            That said, I'm not sending you away empty-handed. Below is my <strong style="color:#111111;">diet guide</strong> — the same type of guide I send my clients. Diet is <strong style="color:#111111;">80% of the equation</strong> when it comes to fitness and looking good. If you only fix one thing, fix this.
          </p>

          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr>
              <td>
                <a href="${GUIDE_URL}"
                  style="display:inline-block;background-color:#b0e455;color:#1a3a06;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.5px;text-decoration:none;padding:15px 32px;border-radius:100px;">
                  Get the Diet Guide →
                </a>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.75;color:#444444;">
            Thank you for applying — genuinely. If the guide helps you, <a href="${IG_URL}" style="color:#3a7a0a;font-weight:700;text-decoration:none;">send me a DM on Instagram</a>. I'd really appreciate it.
          </p>

          <!-- DIVIDER -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr><td style="height:1px;background-color:#eef4e8;font-size:0;line-height:0;">&nbsp;</td></tr>
          </table>

          <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#999999;">
            Talk soon,<br />
            <span style="color:#333333;font-weight:700;">Javi</span>
          </p>

          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.7;color:#777777;">
            <strong style="color:#444444;">P.S.</strong> — if you <em>do</em> want to fight for a spot and you're ready to take your fitness to the next level, <a href="${IG_URL}" style="color:#3a7a0a;font-weight:700;text-decoration:none;">DM me on Instagram</a> and tell me what's changed. That's how you get my attention.
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
