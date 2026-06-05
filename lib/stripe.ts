import "server-only";

import Stripe from "stripe";

/**
 * Server-only Stripe client. Lazily constructed so a missing key throws at call
 * time (in the donation action) rather than at import. Never import in a client
 * component — the secret key must stay server-side.
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set.");
  if (!_stripe) _stripe = new Stripe(key);
  return _stripe;
}

/** Pay-what-you-want donation price ("The Black Budget"). */
export const DONATION_PRICE_ID = process.env.STRIPE_DONATION_PRICE_ID;
