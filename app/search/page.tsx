import type { Metadata } from "next";
import Link from "next/link";
import { searchArchive } from "@/lib/data/search";
import { CaseFileCard } from "@/components/redthread/case-file-card";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const { boards, pins } = query
    ? await searchArchive(query)
    : { boards: [], pins: [] };
  const total = boards.length + pins.length;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
        Cross-Reference
      </p>
      <h1 className="font-typewriter text-4xl uppercase text-foreground sm:text-5xl">
        Search the Archive
      </h1>

      <form action="/search" method="get" className="mt-6 flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={query}
          autoFocus
          placeholder="names, places, theories…"
          className="flex-1 rounded-sm border border-input bg-background px-3 py-2 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-redthread"
        />
        <button
          type="submit"
          className="rounded-sm bg-primary px-5 font-mono text-sm uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/80"
        >
          Run it
        </button>
      </form>

      <div className="thread-rule my-8 h-px" />

      {!query ? (
        <p className="font-mono text-sm text-muted-foreground">
          Pull a thread. Search case files and pinned evidence across the whole
          archive.
        </p>
      ) : total === 0 ? (
        <p className="font-mono text-sm text-muted-foreground">
          Nothing on file for{" "}
          <span className="text-foreground">&ldquo;{query}&rdquo;</span>. Either
          it does not exist, or it has been{" "}
          <span className="text-redthread">expunged</span>.
        </p>
      ) : (
        <div className="space-y-12">
          {boards.length > 0 && (
            <section>
              <h2 className="mb-5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Case files · {boards.length}
              </h2>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {boards.map((b, i) => (
                  <CaseFileCard key={b.id} board={b} tilt={i % 2 ? 1 : -1} />
                ))}
              </div>
            </section>
          )}

          {pins.length > 0 && (
            <section>
              <h2 className="mb-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Pinned evidence · {pins.length}
              </h2>
              <ul className="space-y-2">
                {pins.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/boards/${p.boardSlug}`}
                      className="block rounded-sm border border-border bg-card/50 p-3 transition-colors hover:bg-card"
                    >
                      <div className="font-typewriter text-sm text-foreground">
                        {p.title}
                      </div>
                      {p.body && (
                        <p className="mt-1 line-clamp-2 font-mono text-xs text-muted-foreground">
                          {p.body}
                        </p>
                      )}
                      <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
                        in {p.boardTitle}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
