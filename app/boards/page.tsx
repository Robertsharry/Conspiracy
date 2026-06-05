import type { Metadata } from "next";
import { listCanonRanked, listRecentBoards } from "@/lib/data/boards";
import { getCurrentProfile } from "@/lib/data/profiles";
import { CaseFileCard } from "@/components/redthread/case-file-card";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = { title: "Case Files" };

export default async function BoardsPage() {
  const [canon, recent, me] = await Promise.all([
    listCanonRanked(),
    listRecentBoards(),
    getCurrentProfile(),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            The Archive
          </p>
          <h1 className="font-typewriter text-4xl uppercase text-foreground sm:text-5xl">
            Case Files
          </h1>
        </div>
        {me && (
          <ButtonLink href="/boards/new" className="font-mono uppercase tracking-wider">
            Open a case file
          </ButtonLink>
        )}
      </div>

      <div className="thread-rule my-8 h-px" />

      <section>
        <h2 className="font-typewriter text-2xl uppercase text-foreground">The Canon</h2>
        <p className="mb-6 mt-1 font-mono text-xs text-muted-foreground">
          Ranked by our own plausibility. Argue with the verdict — that&apos;s the point.
        </p>
        {canon.length ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {canon.map((b, i) => (
              <CaseFileCard key={b.id} board={b} tilt={i % 2 ? 1 : -1} />
            ))}
          </div>
        ) : (
          <p className="font-mono text-sm text-muted-foreground">
            The canon is still being compiled. The watchers are slow today.
          </p>
        )}
      </section>

      <section className="mt-14">
        <h2 className="font-typewriter text-2xl uppercase text-foreground">
          Recent Case Files
        </h2>
        <p className="mb-6 mt-1 font-mono text-xs text-muted-foreground">
          Opened by operatives in the field.
        </p>
        {recent.length ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((b, i) => (
              <CaseFileCard key={b.id} board={b} tilt={i % 2 ? -1 : 1} />
            ))}
          </div>
        ) : (
          <p className="font-mono text-sm text-muted-foreground">
            No operative case files yet.{" "}
            {me ? "Open the first." : "Initiate to open the first."}
          </p>
        )}
      </section>
    </div>
  );
}
