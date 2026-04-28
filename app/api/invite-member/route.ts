import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const COACH_EMAILS = ["me@javilorenzana.com", "bea.ongg@gmail.com"];

export async function POST(req: NextRequest) {
  const { email, plan } = await req.json();

  if (!email || !plan) {
    return NextResponse.json({ error: "Email and plan are required." }, { status: 400 });
  }

  // Verify the requester is a coach
  const authHeader = req.headers.get("x-coach-email");
  if (!authHeader || !COACH_EMAILS.includes(authHeader)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Invite the user — sends a magic link / invite email
  const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://zanafitness.com"}/auth/callback`,
  });

  if (inviteError) {
    // If user already exists, just update their profile
    if (!inviteError.message.includes("already been registered")) {
      return NextResponse.json({ error: inviteError.message }, { status: 400 });
    }
  }

  // Upsert the profile with active status and chosen plan
  const userId = inviteData?.user?.id;
  if (userId) {
    await supabase.from("profiles").upsert({
      id: userId,
      email,
      plan,
      status: "active",
      role: "member",
    }, { onConflict: "id" });
  } else {
    // User already existed — find them by email and update profile
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const user = existingUser?.users?.find(u => u.email === email);
    if (user) {
      await supabase.from("profiles").upsert({
        id: user.id,
        email,
        plan,
        status: "active",
        role: "member",
      }, { onConflict: "id" });
    }
  }

  return NextResponse.json({ success: true });
}
