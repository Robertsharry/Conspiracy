import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/** Amount (cents) → benefactor tier. */
function tierForAmount(cents: number): "informant" | "handler" | "architect" {
  if (cents >= 10000) return "architect";
  if (cents >= 2500) return "handler";
  return "informant";
}

/**
 * Stripe webhook. On `checkout.session.completed`, grant the donor their
 * Benefactor mark (service-role upsert into `supporters`). Requires
 * STRIPE_WEBHOOK_SECRET + SUPABASE_SECRET_KEY; returns 501 until configured.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "webhook not configured" }, { status: 501 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "no signature" }, { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;
    const amount = session.amount_total ?? 0;
    if (userId) {
      try {
        const admin = createAdminClient();
        await admin
          .from("supporters")
          .upsert(
            { user_id: userId, tier: tierForAmount(amount) },
            { onConflict: "user_id" },
          );
      } catch {
        // SUPABASE_SECRET_KEY not set — payment still succeeded; mark skipped.
      }
    }
  }

  return NextResponse.json({ received: true });
}
