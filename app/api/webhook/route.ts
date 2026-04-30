import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getPlan(variantId: number): string {
  if (variantId === Number(process.env.NEXT_PUBLIC_LS_VARIANT_3M)) return "entry";
  if (variantId === Number(process.env.NEXT_PUBLIC_LS_VARIANT_6M)) return "committed";
  if (variantId === Number(process.env.NEXT_PUBLIC_LS_VARIANT_12M)) return "all_in";
  return "unknown";
}

function getExpiresAt(plan: string, from: Date): Date {
  const d = new Date(from);
  if (plan === "entry") d.setMonth(d.getMonth() + 3);
  else if (plan === "committed") d.setMonth(d.getMonth() + 6);
  else if (plan === "all_in") d.setMonth(d.getMonth() + 12);
  return d;
}

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature") || "";
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;

  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(rawBody).digest("hex");

  if (digest !== signature) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const eventName = event.meta?.event_name;
  const data = event.data?.attributes;

  if (eventName === "subscription_created") {
    const email = data?.user_email;
    const variantId = data?.variant_id;
    const subscriptionId = String(event.data?.id);
    const plan = getPlan(variantId);
    const now = new Date();
    const expiresAt = getExpiresAt(plan, now);

    // Find the Supabase user by email
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users?.users?.find((u) => u.email === email);

    if (user) {
      await supabase.from("profiles").upsert({
        id: user.id,
        email,
        plan,
        status: "active",
        role: "member",
        subscribed_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        ls_subscription_id: subscriptionId,
      });
    }
  }

  if (eventName === "subscription_cancelled") {
    const subscriptionId = String(event.data?.id);
    await supabase
      .from("profiles")
      .update({ status: "cancelled" })
      .eq("ls_subscription_id", subscriptionId);
  }

  return new Response("OK");
}
