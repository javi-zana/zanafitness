import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

const COACH_EMAILS = ["me@javilorenzana.com"];

// Readable alphabet: omits 0/O, 1/l/I to make the password easy to dictate
const PASSWORD_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

function generatePassword(length = 12): string {
  const bytes = randomBytes(length);
  let pw = "";
  for (let i = 0; i < length; i++) {
    pw += PASSWORD_ALPHABET[bytes[i] % PASSWORD_ALPHABET.length];
  }
  return pw;
}

export async function POST(req: NextRequest) {
  const { email, plan, first_name } = await req.json();

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

  const password = generatePassword();

  // Create the auth user with email already confirmed (no verification email sent)
  const { data: createData, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: first_name ? { first_name } : undefined,
  });

  if (createError) {
    const alreadyExists = /already been registered|already exists/i.test(createError.message);
    return NextResponse.json(
      {
        error: alreadyExists
          ? "An account with that email already exists."
          : createError.message,
      },
      { status: alreadyExists ? 409 : 400 }
    );
  }

  const userId = createData.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Failed to create account." }, { status: 500 });
  }

  // Create the profile row
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      email,
      plan,
      status: "active",
      role: "member",
      first_name: first_name ?? null,
    },
    { onConflict: "id" }
  );

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, email, password, first_name: first_name ?? null });
}
