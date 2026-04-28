import { Paddle } from "@paddle/paddle-node-sdk";

export async function POST(req: Request) {
  const paddle = new Paddle(process.env.PADDLE_API_KEY ?? "");
  const signature = req.headers.get("paddle-signature") || "";
  const rawBody = await req.text();

  try {
    const event = await paddle.webhooks.unmarshal(
      rawBody,
      process.env.PADDLE_WEBHOOK_SECRET!,
      signature
    );

    if (event && event.eventType === "subscription.activated") {
      console.log("Subscription activated:", event.data);
      // TODO: Save to Supabase
    }
  } catch {
    return new Response("Webhook Error", { status: 400 });
  }

  return new Response("OK");
}
