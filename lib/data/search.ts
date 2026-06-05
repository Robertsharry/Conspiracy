import { createClient } from "@/lib/supabase/server";
import type { BoardSummary } from "./boards";

const SUMMARY_COLS =
  "id, slug, title, summary, category, status, is_canon, plausibility, verdict, featured_rank, node_count, post_count, watcher_count, created_at";

export interface PinHit {
  id: string;
  title: string;
  body: string | null;
  boardSlug: string;
  boardTitle: string;
}

/**
 * Full-text search across case files (boards) and pins (nodes). RLS keeps it to
 * readable rows; the `websearch` query type accepts quotes, OR, and `-` natively.
 */
export async function searchArchive(
  q: string,
): Promise<{ boards: BoardSummary[]; pins: PinHit[] }> {
  const query = q.trim();
  if (!query) return { boards: [], pins: [] };

  const supabase = await createClient();
  const [boardsRes, nodesRes] = await Promise.all([
    supabase
      .from("boards")
      .select(SUMMARY_COLS)
      .is("deleted_at", null)
      .textSearch("search_tsv", query, { type: "websearch", config: "english" })
      .limit(24),
    supabase
      .from("nodes")
      .select("id, title, body, board:boards!inner(slug, title)")
      .is("deleted_at", null)
      .textSearch("search_tsv", query, { type: "websearch", config: "english" })
      .limit(24),
  ]);

  const boards = (boardsRes.data as BoardSummary[] | null) ?? [];
  const pins = ((nodesRes.data ?? []) as Array<{
    id: string;
    title: string;
    body: string | null;
    board: unknown;
  }>)
    .map((n) => {
      const b = (Array.isArray(n.board) ? n.board[0] : n.board) as
        | { slug?: string; title?: string }
        | undefined;
      return {
        id: n.id,
        title: n.title,
        body: n.body,
        boardSlug: b?.slug ?? "",
        boardTitle: b?.title ?? "",
      };
    })
    .filter((p) => p.boardSlug);

  return { boards, pins };
}
