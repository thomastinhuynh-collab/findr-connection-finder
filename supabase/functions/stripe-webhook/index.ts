import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@18";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    console.error("Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
    return new Response("Server not configured", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Signature verification failed:", (err as Error).message);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    if (event.type === "account.updated") {
      const account = event.data.object as Stripe.Account;
      const complete = !!account.charges_enabled && !!account.payouts_enabled;

      const admin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );

      const { error } = await admin
        .from("profiles")
        .update({ stripe_onboarding_complete: complete })
        .eq("stripe_account_id", account.id);

      if (error) {
        console.error("Profile update failed:", error.message);
        return new Response("Database error", { status: 500 });
      }
      console.log(`account.updated ${account.id} -> onboarding_complete=${complete}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("stripe-webhook error:", err);
    return new Response("Webhook handler error", { status: 500 });
  }
});
