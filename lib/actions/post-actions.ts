"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const PostSchema = z.object({
  boardId: z.string().uuid(),
  nodeId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  body: z.string().trim().min(1, "Say something.").max(4000, "Too long."),
  revalidate: z.string().optional(),
});

export type CreatePostResult = { id: string } | { error: string };

/**
 * Leave a case-note on a board (or a specific pin, via `nodeId`). Optionally
 * `revalidate` a path (used by the board-level thread; the canvas inspector
 * manages its own state instead).
 */
export async function createPost(input: {
  boardId: string;
  nodeId?: string;
  parentId?: string;
  body: string;
  revalidate?: string;
}): Promise<CreatePostResult> {
  const parsed = PostSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Initiate to leave a case-note." };

  const { data, error } = await supabase
    .from("posts")
    .insert({
      board_id: parsed.data.boardId,
      node_id: parsed.data.nodeId ?? null,
      parent_id: parsed.data.parentId ?? null,
      body: parsed.data.body,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Could not post the note." };
  if (parsed.data.revalidate) revalidatePath(parsed.data.revalidate);
  return { id: data.id };
}
