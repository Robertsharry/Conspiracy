"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Autocomplete operatives by shadow-name prefix, for @mentions. Strips LIKE
 * wildcards from input and skips unclaimed placeholder ("operative-") handles.
 */
export async function searchOperatives(
  prefix: string,
): Promise<{ name: string }[]> {
  const p = prefix.trim().replace(/[%_\\]/g, "");
  if (!p) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("shadow_name")
    .ilike("shadow_name", `${p}%`)
    .not("shadow_name", "ilike", "operative-%")
    .order("shadow_name")
    .limit(6);

  return (data ?? []).map((r) => ({ name: (r as { shadow_name: string }).shadow_name }));
}
