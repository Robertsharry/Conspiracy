"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const ReportSchema = z.object({
  targetType: z.enum(["board", "node", "edge", "post"]),
  targetId: z.string().uuid(),
  reason: z.string().trim().min(1).max(80),
  details: z.string().trim().max(1000).optional(),
});

/** File a moderation report against a board / pin / string / note. */
export async function fileReport(input: {
  targetType: string;
  targetId: string;
  reason: string;
  details?: string;
}): Promise<{ ok: true } | { error: string }> {
  const parsed = ReportSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Initiate to file a report." };

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    target_type: parsed.data.targetType,
    target_id: parsed.data.targetId,
    reason: parsed.data.reason,
    details: parsed.data.details ?? null,
  });
  if (error) return { error: "Could not file the report." };
  return { ok: true };
}
