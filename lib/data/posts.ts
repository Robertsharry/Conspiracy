import { createClient } from "@/lib/supabase/server";

export interface ThreadPost {
  id: string;
  parent_id: string | null;
  body: string;
  score: number;
  created_at: string;
  author_name: string | null;
  my_vote: "corroborate" | "discredit" | null;
}

/** PostgREST may surface an embedded author as an object or a 1-element array. */
function shadowNameOf(author: unknown): string | null {
  if (!author) return null;
  const a = Array.isArray(author) ? author[0] : author;
  return (a as { shadow_name?: string } | undefined)?.shadow_name ?? null;
}

/**
 * Board-level case-notes (node_id is null) for a board, flat and time-ordered,
 * each annotated with the current user's vote. The client builds the reply tree.
 */
export async function getBoardThread(boardId: string): Promise<ThreadPost[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("posts")
    .select("id, parent_id, body, score, created_at, author:profiles(shadow_name)")
    .eq("board_id", boardId)
    .is("node_id", null)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  const rows = (data ?? []) as unknown as Array<{
    id: string;
    parent_id: string | null;
    body: string;
    score: number;
    created_at: string;
    author: unknown;
  }>;

  const voteMap = new Map<string, "corroborate" | "discredit">();
  if (user && rows.length) {
    const { data: votes } = await supabase
      .from("votes")
      .select("target_id, value")
      .eq("voter_id", user.id)
      .eq("target_type", "post")
      .in(
        "target_id",
        rows.map((r) => r.id),
      );
    for (const v of (votes ?? []) as Array<{
      target_id: string;
      value: "corroborate" | "discredit";
    }>) {
      voteMap.set(v.target_id, v.value);
    }
  }

  return rows.map((r) => ({
    id: r.id,
    parent_id: r.parent_id,
    body: r.body,
    score: r.score,
    created_at: r.created_at,
    author_name: shadowNameOf(r.author),
    my_vote: voteMap.get(r.id) ?? null,
  }));
}
