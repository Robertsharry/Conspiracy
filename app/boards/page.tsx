import type { Metadata } from "next";
import { listCanonRanked, listRecentBoards, type BoardSummary } from "@/lib/data/boards";
import { getCurrentProfile } from "@/lib/data/profiles";
import { CaseFileCard } from "@/components/redthread/case-file-card";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = { title: "Case Files" };

function Section({
  title,
  blurb,
  boards,
  flip = false,
}: {
  title: string;
  blurb: string;
  boards: BoardSummary[];
  flip?: boolean;
}) {
  if (boards.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="font-typewriter text-2xl uppercase text-foreground">{title}</h2>
      <p className="mb-6 mt-1 font-mono text-xs text-muted-foreground">{blurb}</p>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {boards.map((b, i) => (
          <CaseFileCard key={b.id} board={b} tilt={(i + (flip ? 1 : 0)) % 2 ? 1 : -1} />
        ))}
      </div>
    </section>
  );
}

export default async function BoardsPage() {
  const [canon, recent, me] = await Promise.all([
    listCanonRanked(),
    listRecentBoards(),
    getCurrentProfile(),
  ]);

  // Canon comes back ranked (featured_rank, then plausibility). featured_rank 50+
  // is the "Active Files" wing (modern/weird); everything else partitions by
  // category.
  const isActive = (b: BoardSummary) =>
    b.featured_rank != null && b.featured_rank >= 50;
  const active = canon.filter(isActive);
  const rest = canon.filter((b) => !isActive(b));
  const scientists = rest.filter((b) => b.category === "person");
  const disappearances = rest.filter((b) => b.category === "disappearance");
  const conspiracies = rest.filter(
    (b) => b.category !== "person" && b.category !== "disappearance",
  );

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

      <Section
        title="Missing Scientists"
        blurb="The ones who knew too much. Ranked — with dossiers and competing theories."
        boards={scientists}
      />
      <Section
        title="Active Files"
        blurb="Modern, open, and genuinely strange — the files still being written."
        boards={active}
      />
      <Section
        title="Disappearances"
        blurb="Vanished without a trace — people, ships, expeditions."
        boards={disappearances}
      />
      <Section
        title="The Canon"
        blurb="Every case weighed by our own plausibility. Argue with the verdict — that is the point."
        boards={conspiracies}
      />

      {canon.length === 0 && (
        <p className="mt-12 font-mono text-sm text-muted-foreground">
          The canon is still being compiled. The watchers are slow today.
        </p>
      )}

      <Section
        title="Recent Case Files"
        blurb="Opened by operatives in the field."
        boards={recent}
        flip
      />
      {recent.length === 0 && (
        <p className="mt-12 font-mono text-sm text-muted-foreground">
          No operative case files yet.{" "}
          {me ? "Open the first." : "Initiate to open the first."}
        </p>
      )}
    </div>
  );
}
