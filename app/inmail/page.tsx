import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/data/profiles";
import { getInmailThreads } from "@/lib/data/messages";
import { ButtonLink } from "@/components/ui/button-link";
import { PaperPanel } from "@/components/redthread/paper-panel";

export const metadata: Metadata = { title: "InMail" };

export default async function InmailPage() {
  const me = await getCurrentProfile();

  if (!me) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <PaperPanel pinned className="w-full max-w-md text-center">
          <h1 className="font-typewriter text-2xl uppercase text-ink">InMail</h1>
          <p className="mt-2 font-mono text-xs text-paper-foreground/85">
            Private channels are for initiated operatives only.
          </p>
          <ButtonLink
            href="/initiation"
            className="mt-4 font-mono uppercase tracking-wider"
          >
            Begin initiation
          </ButtonLink>
        </PaperPanel>
      </div>
    );
  }

  const threads = await getInmailThreads();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Dead Drops
          </p>
          <h1 className="font-typewriter text-4xl uppercase text-foreground">InMail</h1>
        </div>
        <ButtonLink href="/inmail/new" className="font-mono uppercase tracking-wider">
          New drop
        </ButtonLink>
      </div>

      <div className="thread-rule my-8 h-px" />

      {threads.length ? (
        <ul className="divide-y divide-border border-y border-border">
          {threads.map((t) => (
            <li key={t.otherId}>
              <Link
                href={`/inmail/${encodeURIComponent(t.otherName)}`}
                className="flex items-center justify-between gap-4 px-3 py-3 transition-colors hover:bg-card/50"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm uppercase tracking-wide text-foreground">
                      {t.otherName || "unknown"}
                    </span>
                    {t.unread > 0 && (
                      <span className="rounded-full bg-redthread px-1.5 py-0.5 font-mono text-[10px] leading-none text-primary-foreground">
                        {t.unread}
                      </span>
                    )}
                  </div>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {t.lastOutgoing ? "you: " : ""}
                    {t.lastBody}
                  </p>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
                  open ↗
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-mono text-sm text-muted-foreground">
          No drops yet. The channel is quiet — maybe too quiet.
        </p>
      )}
    </div>
  );
}
