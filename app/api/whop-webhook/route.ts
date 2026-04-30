import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const PLAN_MAP: Record<string, string> = {
  plan_BwaPVLzVFjYWL: "all_in",
  plan_DAY1fwI5NfqJe: "committed",
};

function getExpiresAt(plan: string, from: Date): Date {
  const d = new Date(from);
  if (plan === "committed") d.setMonth(d.getMonth() + 4);
  else if (plan === "all_in") d.setMonth(d.getMonth() + 12);
  return d;
}

function verifySignature(rawBody: string, header: string, secret: string): boolean {
  const tPart = header.split(",").find((p) => p.startsWith("t="));
  const v1Part = header.split(",").find((p) => p.startsWith("v1="));
  if (!tPart || !v1Part) return false;

  const timestamp = tPart.slice(2);
  const signature = v1Part.slice(3);
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

async function upsertProfile(
  userId: string,
  email: string,
  plan: string,
  membershipId: string,
  expiresAt: Date
) {
  await supabase.from("profiles").upsert(
    {
      id: userId,
      email,
      plan,
      status: "active",
      role: "member",
      subscribed_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      ls_subscription_id: membershipId,
    },
    { onConflict: "id" }
  );
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signatureHeader = req.headers.get("whop-signature") ?? "";
  const secret = process.env.WHOP_WEBHOOK_SECRET!;

  if (!verifySignature(rawBody, signatureHeader, secret)) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const { action, data } = event;

  if (action === "membership.went_valid") {
    const { email, plan_id, id: membershipId, expires_at: whopExpiresAt } = data;
    const plan = PLAN_MAP[plan_id] ?? "unknown";
    const expiresAt = whopExpiresAt
      ? new Date(whopExpiresAt * 1000)
      : getExpiresAt(plan, new Date());

    const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://zanafitness.com";

    // Try to invite — creates account + sends setup email if new, errors if existing
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      email,
      { redirectTo: `${siteUrl}/auth/callback` }
    );

    if (inviteData?.user) {
      // New user — account just created
      await upsertProfile(inviteData.user.id, email, plan, membershipId, expiresAt);
    } else if (inviteError?.message.includes("already been registered")) {
      // Existing user — find them and update their profile
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const existing = users.find((u) => u.email === email);
      if (existing) {
        await upsertProfile(existing.id, email, plan, membershipId, expiresAt);
      }
    }
  }

  if (action === "membership.went_invalid") {
    await supabase
      .from("profiles")
      .update({ status: "cancelled" })
      .eq("ls_subscription_id", data.id);
  }

  return new Response("OK");
}
