import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBoardBySlug, getBoardGraph } from "@/lib/data/boards";
import { getBoardThread } from "@/lib/data/posts";
import { getCurrentProfile } from "@/lib/data/profiles";
import { BoardCanvasLoader } from "@/components/board/board-canvas-loader";
import { CaseNotesThread } from "@/components/forum/case-notes-thread";
import { PlausibilityMeter } from "@/components/redthread/plausibility-meter";
import { TopSecretStamp } from "@/components/redthread/top-secret-stamp";
import { FlagButton } from "@/components/redthread/flag-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const board = await getBoardBySlug(slug);
  return { title: board?.title ?? "Case File" };
}

export default async function BoardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const board = await getBoardBySlug(slug);
  if (!board) notFound();

  const me = await getCurrentProfile();
  const { nodes, edges } = await getBoardGraph(board.id);
  const thread = await getBoardThread(board.id);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      {/* Dossier header (SSR) */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              {board.category}
            </p>
            {board.is_canon && (
              <span className="font-mono text-[10px] uppercase tracking-widest text-ochre">
                canon
              </span>
            )}
          </div>
          <h1 className="mt-1 font-typewriter text-4xl uppercase text-foreground sm:text-5xl">
            {board.title}
          </h1>
          {board.summary && (
            <p className="mt-3 font-mono text-sm leading-relaxed text-muted-foreground">
              {board.summary}
            </p>
          )}
          {board.is_canon && board.plausibility !== null && (
            <div className="mt-4 max-w-xs">
              <PlausibilityMeter value={board.plausibility} />
            </div>
          )}
          {board.verdict && (
            <p className="mt-2 font-mono text-xs italic text-muted-foreground">
              Verdict: &ldquo;{board.verdict}&rdquo;
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-3">
          {board.status !== "open" && (
            <TopSecretStamp
              variant={board.status === "cold" ? "cold-case" : "confidential"}
              rotate={-6}
            />
          )}
          <FlagButton targetType="board" targetId={board.id} />
        </div>
      </div>

      <div className="thread-rule my-6 h-px" />

      {/* The evidence board (client island) */}
      <BoardCanvasLoader
        boardId={board.id}
        canEdit={!!me}
        me={me ? { id: me.id, name: me.shadow_name, avatarUrl: me.avatar_url } : null}
        initialNodes={nodes}
        initialEdges={edges}
      />

      <p className="mt-3 font-mono text-[11px] text-muted-foreground">
        {me
          ? "Drag a pin to reposition it. Drag from a pin's edge to another to draw the red string."
          : "Initiate to pin evidence and connect the dots."}
      </p>

      <CaseNotesThread
        boardId={board.id}
        canPost={!!me}
        meName={me?.shadow_name ?? null}
        initialPosts={thread}
      />
    </div>
  );
}
