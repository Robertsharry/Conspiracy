"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const VoteSchema = z.object({
  targetType: z.enum(["node", "edge", "post"]),
  targetId: z.string().uuid(),
  value: z.enum(["corroborate", "discredit"]),
});

export type MyVote = "corroborate" | "discredit" | null;
export type VoteResult = { myVote: MyVote } | { error: string };

/**
 * Cast (or toggle) a Corroborate/Discredit vote. Clicking the same value again
 * removes it; a different value switches it. The `apply_vote` DB trigger keeps
 * the target's score and the author's credibility in sync.
 */
export async function castVote(input: {
  targetType: string;
  targetId: string;
  value: "corroborate" | "discredit";
}): Promise<VoteResult> {
  const parsed = VoteSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Initiate to weigh in." };

  const { targetType, targetId, value } = parsed.data;

  const { data: existing } = await supabase
    .from("votes")
    .select("id, value")
    .eq("voter_id", user.id)
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase
      .from("votes")
      .insert({ voter_id: user.id, target_type: targetType, target_id: targetId, value });
    if (error) return { error: error.message };
    return { myVote: value };
  }

  if (existing.value === value) {
    const { error } = await supabase.from("votes").delete().eq("id", existing.id);
    if (error) return { error: error.message };
    return { myVote: null };
  }

  const { error } = await supabase
    .from("votes")
    .update({ value })
    .eq("id", existing.id);
  if (error) return { error: error.message };
  return { myVote: value };
}
