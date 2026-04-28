import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const emailHtml = (email: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're on the list — ZANA Fitness</title>
</head>
<body style="margin:0;padding:0;background-color:#121821;font-family:'Courier New',Courier,monospace;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#121821;padding:48px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- LOGO -->
          <tr>
            <td align="center" style="padding-bottom:40px;">
              <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:22px;font-weight:700;letter-spacing:0.3em;color:#ffffff;text-transform:uppercase;">ZANA</p>
              <p style="margin:4px 0 0;font-family:'Courier New',Courier,monospace;font-size:9px;letter-spacing:0.3em;color:#b3cdff;text-transform:uppercase;">Fitness</p>
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr>
            <td align="center" style="padding-bottom:40px;">
              <table width="32" cellpadding="0" cellspacing="0">
                <tr><td style="height:1px;background-color:#b3cdff;font-size:0;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>

          <!-- MAIN CARD -->
          <tr>
            <td style="background-color:#1a222c;border:1px solid #2d3a4b;border-radius:16px;padding:48px 40px;">

              <!-- LABEL -->
              <p style="margin:0 0 16px;font-family:'Courier New',Courier,monospace;font-size:9px;letter-spacing:0.25em;color:#b3cdff;text-transform:uppercase;text-align:center;">
                Access Confirmed
              </p>

              <!-- HEADING -->
              <h1 style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:28px;font-weight:300;letter-spacing:0.1em;color:#ffffff;text-transform:uppercase;text-align:center;line-height:1.3;">
                You&rsquo;re on<br/>the list.
              </h1>

              <!-- DIVIDER -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr><td style="height:1px;background-color:#2d3a4b;font-size:0;">&nbsp;</td></tr>
              </table>

              <!-- BODY -->
              <p style="margin:0 0 16px;font-family:'Courier New',Courier,monospace;font-size:10px;line-height:1.9;letter-spacing:0.15em;color:#9ca3af;text-transform:uppercase;text-align:center;">
                We&rsquo;ll reach out as soon as slots<br/>for ZANA Fitness open.
              </p>
              <p style="margin:0 0 32px;font-family:'Courier New',Courier,monospace;font-size:10px;line-height:1.9;letter-spacing:0.15em;color:#9ca3af;text-transform:uppercase;text-align:center;">
                When they do &mdash; move fast.<br/>Access is limited.
              </p>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://zana-fitness.vercel.app/system"
                      style="display:inline-block;background-color:#b3cdff;color:#121821;font-family:'Courier New',Courier,monospace;font-size:9px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;text-decoration:none;padding:14px 32px;border-radius:100px;">
                      View The System
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="padding-top:40px;">
              <table width="32" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr><td style="height:1px;background-color:#2d3a4b;font-size:0;">&nbsp;</td></tr>
              </table>
              <p style="margin:0 0 8px;font-family:'Courier New',Courier,monospace;font-size:9px;letter-spacing:0.2em;color:#4b5563;text-transform:uppercase;">
                Built for results. Not motivation.
              </p>
              <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:9px;letter-spacing:0.15em;color:#374151;text-transform:uppercase;">
                &copy; 2026 Zana Fitness &nbsp;&middot;&nbsp;
                <a href="https://zana-fitness.vercel.app/terms" style="color:#374151;text-decoration:none;">Terms</a>
                &nbsp;&middot;&nbsp;
                <a href="https://zana-fitness.vercel.app/privacy" style="color:#374151;text-decoration:none;">Privacy</a>
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
    html: emailHtml(email),
  });

  return NextResponse.json({ success: true });
}
