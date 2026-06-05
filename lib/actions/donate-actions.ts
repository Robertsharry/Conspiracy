"use server";

import { headers } from "next/headers";
import { getStripe, DONATION_PRICE_ID } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

/**
 * Open a Stripe Checkout session for a pay-what-you-want donation. The price is
 * a `custom_unit_amount` price, so the supporter chooses the amount on Stripe's
 * page. If signed in, we attach their id so the webhook can grant the Benefactor
 * mark. Returns a redirect URL, or an error.
 */
export async function startDonation(): Promise<
  { url: string } | { error: string }
> {
  if (!DONATION_PRICE_ID) return { error: "Donations are not wired up yet." };

  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = host.startsWith("localhost") ? "http" : "https";
  const origin = `${proto}://${host}`;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let shadowName = "";
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("shadow_name")
      .eq("id", user.id)
      .single();
    shadowName = data?.shadow_name ?? "";
  }

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: DONATION_PRICE_ID, quantity: 1 }],
      submit_type: "donate",
      success_url: `${origin}/donate?status=success`,
      cancel_url: `${origin}/donate?status=cancelled`,
      client_reference_id: user?.id,
      metadata: { shadow_name: shadowName },
    });
    if (!session.url) return { error: "Could not open the channel." };
    return { url: session.url };
  } catch {
    return { error: "Could not open the channel. Try again." };
  }
}
