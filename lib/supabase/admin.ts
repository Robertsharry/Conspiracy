import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — **BYPASSES Row Level Security**.
 *
 * SERVER-ONLY (the `server-only` import makes a client bundle fail loudly).
 * Reserved for trusted server work that must sidestep RLS: moderation actions
 * (soft-delete/redact) and the cron signal-snapshot job (Phase 3+).
 *
 * Requires `SUPABASE_SECRET_KEY` (sb_secret_…). Throws if it is missing so we
 * never silently fall back to a less-privileged key.
 */
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "SUPABASE_SECRET_KEY is not set — the service-role client is required for moderation/cron (Phase 3+).",
    );
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
