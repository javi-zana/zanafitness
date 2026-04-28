import crypto from "crypto";

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

  if (eventName === "subscription_created") {
    console.log("Subscription created:", event.data);
    // TODO: Save to Supabase
  }

  if (eventName === "subscription_cancelled") {
    console.log("Subscription cancelled:", event.data);
    // TODO: Update Supabase
  }

  return new Response("OK");
}
