"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/actions/profile-actions";

const CATEGORIES = [
  "conspiracy",
  "disappearance",
  "event",
  "phenomenon",
  "coverup",
  "person",
  "other",
] as const;

const NewBoardSchema = z.object({
  title: z
    .string()
    .trim()
    .min(4, "Give the case file a real title (4+ characters).")
    .max(120, "Keep the title under 120 characters."),
  summary: z.string().trim().max(600, "Summary is too long.").optional(),
  category: z.enum(CATEGORIES).default("conspiracy"),
});

/** URL-safe slug base from a title. */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/**
 * Open a new (user-authored) case file and redirect to its board. Canon boards
 * are seeded separately via the service role, not through this action.
 */
export async function createBoard(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = NewBoardSchema.safeParse({
    title: formData.get("title"),
    summary: formData.get("summary") || undefined,
    category: formData.get("category") || "conspiracy",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Initiate before opening a case file." };
  }

  const base = slugify(parsed.data.title) || "case-file";
  const slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;

  const { error } = await supabase.from("boards").insert({
    slug,
    title: parsed.data.title,
    summary: parsed.data.summary ?? null,
    category: parsed.data.category,
    created_by: user.id,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Slug collision — try opening it again." };
    }
    return { error: "Could not open the case file. Try again." };
  }

  revalidatePath("/boards");
  redirect(`/boards/${slug}`);
}
