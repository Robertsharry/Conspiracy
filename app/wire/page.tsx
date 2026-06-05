import type { Metadata } from "next";
import { getWireFeeds } from "@/lib/wire";
import { listRecentBoards } from "@/lib/data/boards";
import { getCurrentProfile } from "@/lib/data/profiles";
import { WireBoard } from "@/components/wire/wire-board";

export const metadata: Metadata = { title: "The Wire" };

export default async function WirePage() {
  const [feeds, boards, me] = await Promise.all([
    getWireFeeds(),
    listRecentBoards(40),
    getCurrentProfile(),
  ]);

  const live = [feeds.quakes, feeds.flights, feeds.events, feeds.apod].filter(
    (f) => f.ok,
  ).length;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Live Intercept
          </p>
          <h1 className="font-typewriter text-4xl uppercase text-foreground sm:text-5xl">
            The Wire
          </h1>
        </div>
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span
            className={
              live > 0
                ? "size-2 animate-pulse rounded-full bg-redthread"
                : "size-2 rounded-full bg-muted-foreground/40"
            }
          />
          {live}/4 channels live
        </span>
      </div>

      <p className="mt-5 max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground">
        The watchtower. Real-world feeds, live — and any signal you catch can be
        pinned straight onto a board as evidence. A quake near the wrong place, a
        flight that drops off every tracker, an event that lines up too neatly.
        The world hands you the dots; you draw the string.
      </p>

      <div className="thread-rule my-8 h-px" />

      <WireBoard
        feeds={feeds}
        boards={boards.map((b) => ({ id: b.id, title: b.title }))}
        canPin={!!me}
      />
    </div>
  );
}
