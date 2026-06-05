"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const ShadowNameSchema = z
  .string()
  .trim()
  .min(3, "Shadow names need at least 3 characters.")
  .max(24, "Keep it under 24 characters.")
  .regex(
    /^[a-zA-Z0-9_.-]+$/,
    "Letters, numbers, dots, dashes, and underscores only.",
  )
  .refine((s) => !s.toLowerCase().startsWith("operative-"), {
    message: "That prefix is reserved.",
  });

export interface ActionState {
  error?: string;
}

/**
 * Claim (or change) the signed-in operative's shadow name, then send them to
 * their dossier. Surfaces validation and uniqueness errors for the form.
 */
export async function claimShadowName(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = ShadowNameSchema.safeParse(formData.get("shadow_name"));
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be initiated first." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ shadow_name: parsed.data })
    .eq("id", user.id);

  if (error) {
    // 23505 = unique_violation (citext unique on shadow_name)
    if (error.code === "23505") {
      return { error: "That shadow name is already taken. The watchers noticed." };
    }
    return { error: "Could not claim that name. Try another." };
  }

  revalidatePath("/", "layout");
  redirect(`/dossier/${parsed.data}`);
}

/** Sign the current operative out. */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

/** Point the operative's profile at a newly-uploaded avatar URL. */
export async function updateAvatar(
  url: string,
): Promise<{ ok: true } | { error: string }> {
  if (!/^https:\/\/[^\s]+$/.test(url)) return { error: "Invalid image URL." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Initiate first." };

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: url })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}

/** Write the operative's "field notes" (profile bio). */
export async function updateBio(
  bio: string,
): Promise<{ ok: true } | { error: string }> {
  if (bio.length > 1000) {
    return { error: "Keep field notes under 1000 characters." };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Initiate first." };

  const { error } = await supabase
    .from("profiles")
    .update({ bio: bio.trim() || null })
    .eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}
