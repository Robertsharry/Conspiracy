import Link from "next/link";
import { PaperPanel } from "@/components/redthread/paper-panel";
import { PlausibilityMeter } from "@/components/redthread/plausibility-meter";
import { TopSecretStamp } from "@/components/redthread/top-secret-stamp";
import type { BoardSummary } from "@/lib/data/boards";

/**
 * CaseFileCard — a board summary as a pinned manila card. Shows our
 * plausibility meter + verdict for canon files; counts for all.
 */
export function CaseFileCard({
  board,
  tilt = 0,
}: {
  board: BoardSummary;
  tilt?: number;
}) {
  return (
    <Link
      href={`/boards/${board.slug}`}
      className="block rounded-[2px] outline-none focus-visible:ring-2 focus-visible:ring-redthread"
    >
      <PaperPanel
        tilt={tilt}
        pinned
        className="flex h-full flex-col transition-transform duration-200 hover:-translate-y-1 hover:rotate-0"
      >
        <div className="flex items-start justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faded">
            {board.category}
          </span>
          {board.status === "cold" && (
            <TopSecretStamp variant="cold-case" rotate={5} className="text-[0.5rem]" />
          )}
        </div>

        <h3 className="mt-2 font-typewriter text-xl leading-tight text-ink">
          {board.title}
        </h3>

        {board.summary && (
          <p className="mt-2 line-clamp-3 font-mono text-xs leading-relaxed text-paper-foreground/85">
            {board.summary}
          </p>
        )}

        {board.is_canon && board.plausibility !== null && (
          <div className="mt-3">
            <PlausibilityMeter value={board.plausibility} />
          </div>
        )}

        {board.verdict && (
          <p className="mt-2 font-mono text-[11px] italic leading-snug text-ink-faded">
            &ldquo;{board.verdict}&rdquo;
          </p>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-ink/15 pt-3 font-mono text-[10px] uppercase tracking-widest text-ink-faded">
          <span>{board.node_count} pins</span>
          <span>{board.post_count} notes</span>
        </div>
      </PaperPanel>
    </Link>
  );
}
