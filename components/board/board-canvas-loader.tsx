"use client";

import dynamic from "next/dynamic";
import type { BoardCanvasProps } from "./board-canvas";

/**
 * Loads the @xyflow evidence board client-only (it touches `window`/measurement),
 * with a themed "DECRYPTING…" placeholder. The board page's dossier header still
 * SSRs for SEO; only this canvas is deferred.
 */
const BoardCanvas = dynamic(
  () => import("./board-canvas").then((m) => m.BoardCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[70vh] items-center justify-center rounded-sm border border-border cork-texture">
        <p className="font-typewriter text-xl uppercase tracking-wide text-paper/80">
          Decrypting…
        </p>
      </div>
    ),
  },
);

export function BoardCanvasLoader(props: BoardCanvasProps) {
  return <BoardCanvas {...props} />;
}
