import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client (Client Components).
 *
 * Uses the publishable key — safe to ship to the browser. All access is gated
 * by Row Level Security, never by key secrecy.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
