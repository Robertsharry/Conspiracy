import { createClient } from "@/lib/supabase/server";

/** The current supporter tier for a user, or null if not a benefactor. */
export async function getSupporterTier(userId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("supporters")
    .select("tier")
    .eq("user_id", userId)
    .maybeSingle();
  return data?.tier ?? null;
}

export interface Patron {
  shadow_name: string;
  tier: string;
}

/** The Wall of Patrons — everyone who funds the operation. Oldest first. */
export async function getPatrons(): Promise<Patron[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("supporters")
    .select("tier, profile:profiles!inner(shadow_name)")
    .order("since", { ascending: true });

  return ((data ?? []) as Array<{ tier: string; profile: unknown }>).map((r) => {
    const p = (Array.isArray(r.profile) ? r.profile[0] : r.profile) as
      | { shadow_name?: string }
      | undefined;
    return { shadow_name: p?.shadow_name ?? "anonymous", tier: r.tier };
  });
}
