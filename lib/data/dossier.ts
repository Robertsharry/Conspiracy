import { createClient } from "@/lib/supabase/server";
import type { BoardSummary } from "./boards";

const SUMMARY_COLS =
  "id, slug, title, summary, category, status, is_canon, plausibility, verdict, node_count, post_count, watcher_count, created_at";

/**
 * Case files opened by an operative. RLS already filters visibility — the owner
 * sees their unlisted/private boards; everyone else sees only public ones.
 */
export async function getBoardsByCreator(
  creatorId: string,
  limit = 12,
): Promise<BoardSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("boards")
    .select(SUMMARY_COLS)
    .eq("created_by", creatorId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as BoardSummary[]) ?? [];
}

export interface ActivityItem {
  kind: "note" | "pin";
  boardSlug: string;
  boardTitle: string;
  snippet: string;
  created_at: string;
}

/** Embedded board may arrive as an object or 1-element array (PostgREST). */
function boardOf(b: unknown): { slug: string; title: string } | null {
  if (!b) return null;
  const x = (Array.isArray(b) ? b[0] : b) as
    | { slug?: string; title?: string }
    | undefined;
  return x?.slug && x?.title ? { slug: x.slug, title: x.title } : null;
}

/**
 * Recent contributions (case-notes + pins) by an operative, newest first.
 * RLS keeps it to boards the viewer can read.
 */
export async function getRecentActivity(
  creatorId: string,
  limit = 10,
): Promise<ActivityItem[]> {
  const supabase = await createClient();
  const [postsRes, nodesRes] = await Promise.all([
    supabase
      .from("posts")
      .select("id, body, created_at, board:boards(slug, title)")
      .eq("created_by", creatorId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("nodes")
      .select("id, title, created_at, board:boards(slug, title)")
      .eq("created_by", creatorId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(limit),
  ]);

  const items: ActivityItem[] = [];
  for (const p of (postsRes.data ?? []) as Array<{
    body: string;
    created_at: string;
    board: unknown;
  }>) {
    const b = boardOf(p.board);
    if (b) {
      items.push({
        kind: "note",
        boardSlug: b.slug,
        boardTitle: b.title,
        snippet: p.body,
        created_at: p.created_at,
      });
    }
  }
  for (const n of (nodesRes.data ?? []) as Array<{
    title: string;
    created_at: string;
    board: unknown;
  }>) {
    const b = boardOf(n.board);
    if (b) {
      items.push({
        kind: "pin",
        boardSlug: b.slug,
        boardTitle: b.title,
        snippet: n.title,
        created_at: n.created_at,
      });
    }
  }

  items.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  return items.slice(0, limit);
}
