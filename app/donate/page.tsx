import type { Metadata } from "next";
import { getPatrons } from "@/lib/data/supporters";
import { SUPPORTER_TIERS } from "@/lib/supporters";
import { PaperPanel } from "@/components/redthread/paper-panel";
import { TopSecretStamp } from "@/components/redthread/top-secret-stamp";
import { BenefactorMark } from "@/components/redthread/benefactor-mark";
import { DonateButton } from "@/components/redthread/donate-button";

export const metadata: Metadata = { title: "The Black Budget" };

export default async function DonatePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const patrons = await getPatrons();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      {status === "success" && (
        <div className="mb-8 rounded-sm border border-ochre/40 bg-ochre/10 px-4 py-3">
          <p className="font-mono text-[11px] uppercase tracking-widest text-ochre">
            Channel received
          </p>
          <p className="mt-1 font-mono text-sm text-foreground">
            The file remembers. If you were signed in, your Benefactor mark is
            being struck onto your dossier. Welcome to the inner circle.
          </p>
        </div>
      )}
      {status === "cancelled" && (
        <div className="mb-8 rounded-sm border border-border px-4 py-3">
          <p className="font-mono text-sm text-muted-foreground">
            Channel closed — nothing was taken. The door stays open if you change
            your mind.
          </p>
        </div>
      )}

      {/* Hero */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Classified Appropriation
          </p>
          <h1 className="font-typewriter text-4xl uppercase text-foreground sm:text-5xl">
            The Black Budget
          </h1>
        </div>
        <TopSecretStamp variant="eyes-only" rotate={-7} />
      </div>

      <p className="mt-5 max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground">
        REDTHREAD runs on conviction and server bills. No ads, no investors
        watching the metrics — just the work, and the people who quietly keep it
        funded. Chip in and you don&apos;t get a thank-you email. You get a place
        in the file.
      </p>

      <div className="thread-rule my-8 h-px" />

      {/* What you get */}
      <h2 className="font-typewriter text-2xl uppercase text-foreground">
        What it buys you
      </h2>
      <ul className="mt-3 grid gap-2 font-mono text-sm text-muted-foreground sm:grid-cols-2">
        <li>◆ A permanent <span className="text-ochre">Benefactor</span> mark on your dossier.</li>
        <li>◆ A spot on the <span className="text-foreground">Wall of Patrons</span> below.</li>
        <li>◆ The good kind of clearance — the kind you earned with your own money.</li>
        <li>◆ A genuinely independent corner of the web, kept alive.</li>
      </ul>

      {/* Tiers */}
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {SUPPORTER_TIERS.map((t, i) => (
          <PaperPanel key={t.key} tilt={i % 2 ? 1 : -1} pinned className="flex flex-col">
            <span
              className="font-mono text-[10px] uppercase tracking-widest"
              style={{ color: t.color }}
            >
              {t.label}
            </span>
            <p className="mt-1 font-typewriter text-lg leading-tight text-ink">
              Bankroll {t.lineItem}
            </p>
            <p className="mt-2 font-mono text-xs text-paper-foreground/85">{t.funds}</p>
            <p className="mt-2 font-mono text-[11px] italic text-ink-faded">
              &ldquo;{t.blurb}&rdquo;
            </p>
            <div className="mt-3 border-t border-ink/15 pt-2">
              <BenefactorMark tier={t.key} />
            </div>
          </PaperPanel>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-10 flex flex-col items-center gap-3 text-center">
        <DonateButton />
        <p className="max-w-md font-mono text-[11px] leading-relaxed text-muted-foreground">
          Pay what it&apos;s worth to you — you set the amount. Payments run
          through Stripe; REDTHREAD never sees your card. Sign in first and your{" "}
          <span className="text-ochre">Benefactor</span> mark is struck
          automatically once the payment clears.
        </p>
      </div>

      <div className="thread-rule my-10 h-px" />

      {/* Wall of Patrons */}
      <h2 className="font-typewriter text-2xl uppercase text-foreground">
        The Wall of Patrons
      </h2>
      <p className="mb-5 mt-1 font-mono text-xs text-muted-foreground">
        The ones who keep the lights on.
      </p>
      {patrons.length ? (
        <div className="flex flex-wrap gap-2">
          {patrons.map((p) => (
            <span
              key={p.shadow_name}
              className="inline-flex items-center gap-2 rounded-sm border border-border bg-card/60 px-3 py-1.5"
            >
              <span className="font-mono text-xs uppercase tracking-wide text-foreground">
                {p.shadow_name}
              </span>
              <BenefactorMark tier={p.tier} />
            </span>
          ))}
        </div>
      ) : (
        <p className="font-mono text-sm text-muted-foreground">
          No names on the wall yet. Be the first to keep it lit.
        </p>
      )}
    </div>
  );
}
