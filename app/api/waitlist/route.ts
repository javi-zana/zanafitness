import { Resend } from "resend";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { email } = await req.json();

  await resend.emails.send({
    from: "ZANA <hello@zanafitness.com>",
    to: "hello@zanafitness.com",
    subject: "New ZANA Signup",
    html: `<p>${email} joined the system</p>`,
  });

  await resend.emails.send({
    from: "ZANA <hello@zanafitness.com>",
    to: email,
    subject: "You're in.",
    html: `
      <h2 style="font-family:sans-serif;font-weight:300;letter-spacing:0.1em;text-transform:uppercase;">Welcome to ZANA.</h2>
      <p style="font-family:sans-serif;color:#666;">This isn't a program.</p>
      <p style="font-family:sans-serif;color:#666;">It's a system.</p>
      <br/>
      <p style="font-family:sans-serif;color:#666;">We'll let you know when access opens.</p>
    `,
  });

  return NextResponse.json({ success: true });
}
