import { createClient } from "@/lib/supabase/server";

/** A profile row (subset we read in the UI). */
export interface Profile {
  id: string;
  shadow_name: string;
  display_name: string | null;
  rank: string;
  credibility: number;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

/** True while a profile still carries its auto-generated placeholder handle. */
export function isUnclaimed(profile: Pick<Profile, "shadow_name">): boolean {
  return profile.shadow_name.startsWith("operative-");
}

/** The signed-in user's profile, or null if not authenticated. */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, shadow_name, display_name, rank, credibility, bio, avatar_url, created_at")
    .eq("id", user.id)
    .single();
  return data;
}

/** Look up a public profile by its shadow name. */
export async function getProfileByShadowName(
  shadowName: string,
): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, shadow_name, display_name, rank, credibility, bio, avatar_url, created_at")
    .eq("shadow_name", shadowName)
    .maybeSingle();
  return data;
}
