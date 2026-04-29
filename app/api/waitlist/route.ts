import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const LOGO_URL = "https://raw.githubusercontent.com/javi-zana/zanafitness/main/public/logo.png";

const emailHtml = () => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're on the list — ZANA Fitness</title>
</head>
<body style="margin:0;padding:0;background-color:#141414;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#141414;">
  <tr>
    <td align="center" style="padding:56px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:500px;">

      <!-- WORDMARK -->
      <tr>
        <td align="center" style="padding-bottom:48px;">
          <img src="${LOGO_URL}" alt="ZANA Fitness" width="140" style="display:block;max-width:140px;" />
        </td>
      </tr>

      <!-- ACCENT LINE -->
      <tr>
        <td align="center" style="padding-bottom:48px;">
          <table width="40" cellpadding="0" cellspacing="0">
            <tr><td style="height:1px;background-color:#b3cdff;font-size:0;line-height:0;">&nbsp;</td></tr>
          </table>
        </td>
      </tr>

      <!-- CARD -->
      <tr>
        <td style="background-color:#121821;border:1px solid #2d3a4b;border-radius:4px;padding:56px 48px;">

          <!-- EYEBROW -->
          <p style="margin:0 0 24px;font-family:'Courier New',Courier,monospace;font-size:11px;letter-spacing:4px;color:#b3cdff;text-transform:uppercase;text-align:center;">
            — Access Confirmed —
          </p>

          <!-- HEADING -->
          <h1 style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:32px;font-weight:200;letter-spacing:6px;color:#ffffff;text-transform:uppercase;text-align:center;line-height:1.2;">
            YOU'RE ON
          </h1>
          <h1 style="margin:0 0 40px;font-family:Arial,Helvetica,sans-serif;font-size:32px;font-weight:200;letter-spacing:6px;color:#b3cdff;text-transform:uppercase;text-align:center;line-height:1.2;">
            THE LIST.
          </h1>

          <!-- RULE -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:40px;">
            <tr><td style="height:1px;background-color:#2d3a4b;font-size:0;line-height:0;">&nbsp;</td></tr>
          </table>

          <!-- BODY -->
          <p style="margin:0 0 12px;font-family:'Courier New',Courier,monospace;font-size:13px;line-height:1.8;letter-spacing:1px;color:#9ca3af;text-align:center;">
            We'll reach out the moment slots for ZANA open.
          </p>
          <p style="margin:0 0 48px;font-family:'Courier New',Courier,monospace;font-size:13px;line-height:1.8;letter-spacing:1px;color:#9ca3af;text-align:center;">
            When they do — move fast. Access is limited.
          </p>

          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <a href="https://zanafitness.com/system"
                  style="display:inline-block;background-color:#b3cdff;color:#141414;font-family:'Courier New',Courier,monospace;font-size:8px;font-weight:700;letter-spacing:4px;text-transform:uppercase;text-decoration:none;padding:16px 40px;border-radius:100px;">
                  VIEW THE SYSTEM
                </a>
              </td>
            </tr>
          </table>

        </td>
      </tr>

      <!-- FOOTER RULE -->
      <tr>
        <td style="padding-top:48px;padding-bottom:24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="height:1px;background-color:#1a222c;font-size:0;line-height:0;">&nbsp;</td></tr>
          </table>
        </td>
      </tr>

      <!-- FOOTER TEXT -->
      <tr>
        <td align="center" style="padding-bottom:8px;">
          <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:10px;letter-spacing:2px;color:#4b5563;text-transform:uppercase;">
            Built for results. Not motivation.
          </p>
        </td>
      </tr>
      <tr>
        <td align="center">
          <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:10px;letter-spacing:1px;color:#374151;text-transform:uppercase;">
            &copy; 2026 Zana Fitness &nbsp;&middot;&nbsp;
            <a href="https://zanafitness.com/terms" style="color:#374151;text-decoration:none;">Terms</a>
            &nbsp;&middot;&nbsp;
            <a href="https://zanafitness.com/privacy" style="color:#374151;text-decoration:none;">Privacy</a>
          </p>
        </td>
      </tr>

    </table>
    </td>
  </tr>
</table>
</body>
</html>
`;

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("waitlist")
    .insert({ email });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Already on the list" }, { status: 409 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "ZANA Fitness <onboarding@resend.dev>",
    to: email,
    subject: "You're on the list.",
    html: emailHtml(),
  });

  return NextResponse.json({ success: true });
}
