// Acceptance email sent when an application is accepted. Shared by the legacy
// /api/application-action route and the ai-tool applications inbox.

export const FROM_EMAIL = 'Javier Lorenzana <javi@zanafitness.com>'
export const BOOKING_URL = 'https://cal.com/zanafitness/intro'
export const ACCEPT_SUBJECT = "Let's talk — here's the link to book your call"

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

export function acceptEmailHtml(firstName: string) {
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
                <a href="${BOOKING_URL}"
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
