import { createClient } from "@/lib/supabase/server";

export interface BoardSummary {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  category: string;
  status: string;
  is_canon: boolean;
  plausibility: number | null;
  verdict: string | null;
  featured_rank: number | null;
  node_count: number;
  post_count: number;
  watcher_count: number;
  created_at: string;
}

export interface BoardDetail extends BoardSummary {
  visibility: string;
  cover_url: string | null;
  created_by: string | null;
}

export interface NodeRow {
  id: string;
  board_id: string;
  type: string;
  title: string;
  body: string | null;
  x: number;
  y: number;
  rotation: number;
  width: number | null;
  height: number | null;
  media_url: string | null;
  source_url: string | null;
  metadata: Record<string, unknown>;
  score: number;
}

export interface EdgeRow {
  id: string;
  board_id: string;
  source_node_id: string;
  target_node_id: string;
  label: string | null;
  kind: string;
  score: number;
}

const SUMMARY_COLS =
  "id, slug, title, summary, category, status, is_canon, plausibility, verdict, featured_rank, node_count, post_count, watcher_count, created_at";

/** Canon case files, ordered by OUR plausibility (then manual featured rank). */
export async function listCanonRanked(limit = 60): Promise<BoardSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("boards")
    .select(SUMMARY_COLS)
    .eq("is_canon", true)
    .is("deleted_at", null)
    .order("featured_rank", { ascending: true, nullsFirst: false })
    .order("plausibility", { ascending: false, nullsFirst: false })
    .limit(limit);
  return (data as BoardSummary[]) ?? [];
}

/** Recent public, non-canon case files opened by operatives. */
export async function listRecentBoards(limit = 24): Promise<BoardSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("boards")
    .select(SUMMARY_COLS)
    .eq("visibility", "public")
    .eq("is_canon", false)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as BoardSummary[]) ?? [];
}

export async function getBoardBySlug(slug: string): Promise<BoardDetail | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("boards")
    .select(`${SUMMARY_COLS}, visibility, cover_url, created_by`)
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();
  return (data as BoardDetail | null) ?? null;
}

/** The full graph (pins + strings) for the evidence board canvas. */
export async function getBoardGraph(
  boardId: string,
): Promise<{ nodes: NodeRow[]; edges: EdgeRow[] }> {
  const supabase = await createClient();
  const [nodesRes, edgesRes] = await Promise.all([
    supabase
      .from("nodes")
      .select(
        "id, board_id, type, title, body, x, y, rotation, width, height, media_url, source_url, metadata, score",
      )
      .eq("board_id", boardId)
      .is("deleted_at", null),
    supabase
      .from("edges")
      .select("id, board_id, source_node_id, target_node_id, label, kind, score")
      .eq("board_id", boardId)
      .is("deleted_at", null),
  ]);
  return {
    nodes: (nodesRes.data as NodeRow[]) ?? [],
    edges: (edgesRes.data as EdgeRow[]) ?? [],
  };
}
