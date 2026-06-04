import { ButtonLink } from "@/components/ui/button-link";
import { PaperPanel } from "@/components/redthread/paper-panel";
import { TopSecretStamp, type StampVariant } from "@/components/redthread/top-secret-stamp";
import { RedactedText } from "@/components/redthread/redacted-text";
import { Typewriter } from "@/components/redthread/typewriter";

/** Placeholder dossiers for the landing showcase. Real boards arrive in Phase 1. */
const SAMPLE_FILES: {
  code: string;
  title: string;
  stamp: StampVariant;
  tilt: number;
  blurb: string;
  redacted: string;
  tail: string;
  watchers: number;
  pins: number;
}[] = [
  {
    code: "CASE-0447",
    title: "The Denver Airport Files",
    stamp: "top-secret",
    tilt: -1.5,
    blurb: "Apocalyptic murals, a blue mustang with glowing eyes, and miles of tunnels that officially do not exist beneath",
    redacted: "the lower concourse",
    tail: ". Coincidence? We pinned forty-one things that say no.",
    watchers: 312,
    pins: 88,
  },
  {
    code: "CASE-0231",
    title: "Project: Clear Skies",
    stamp: "classified",
    tilt: 1.5,
    blurb: "They keep telling us it's just condensation. So why does the flight log for",
    redacted: "tail number N-7 echo whiskey",
    tail: " vanish from every public tracker at the exact same altitude?",
    watchers: 207,
    pins: 54,
  },
  {
    code: "CASE-0119",
    title: "The Mandela Variance",
    stamp: "cold-case",
    tilt: -2.5,
    blurb: "Thousands remember it differently. The logo, the spelling, the year he died. Either the record changed, or",
    redacted: "we did",
    tail: ". This file stays open until the timelines reconcile.",
    watchers: 489,
    pins: 132,
  },
];

export default function Home() {
  return (
    <>
      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 py-20 sm:py-28">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.4em] text-muted-foreground">
            Open Dossier · File N&deg; 0001 · Est. MMXXVI
          </p>

          <h1 className="font-typewriter text-6xl font-bold uppercase leading-none tracking-tight sm:text-8xl">
            <span className="text-redthread drop-shadow-[0_0_18px_oklch(0.53_0.21_25_/_0.45)]">
              Red
            </span>
            thread
          </h1>

          <div className="thread-rule mt-6 h-px w-48" />

          <p className="mt-6 font-typewriter text-2xl text-foreground sm:text-3xl">
            <Typewriter text="Pull the thread." />
          </p>

          <p className="mt-6 max-w-xl font-mono text-sm leading-relaxed text-muted-foreground">
            Nothing is a coincidence. Pin the evidence, draw the string between
            the dots, and let the pattern reveal itself. A board for the ones who
            already know — and the ones about to.
          </p>

          <p className="mt-5 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Your clearance level:{" "}
            <RedactedText className="align-middle">they haven&apos;t decided yet</RedactedText>
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink
              href="/initiation"
              size="lg"
              className="h-11 px-6 font-mono text-sm uppercase tracking-wider"
            >
              Begin Initiation
            </ButtonLink>
            <ButtonLink
              href="/boards"
              size="lg"
              variant="outline"
              className="h-11 px-6 font-mono text-sm uppercase tracking-wider"
            >
              Enter the Archive
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* ── ACTIVE CASE FILES (on the cork board) ──────────────────────── */}
      <section className="cork-texture relative border-y border-black/30 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex items-center justify-center gap-4">
            <div className="thread-rule h-px w-16 sm:w-24" />
            <h2 className="font-typewriter text-2xl uppercase tracking-[0.2em] text-paper drop-shadow-[0_1px_2px_oklch(0_0_0/0.6)]">
              Active Case Files
            </h2>
            <div className="thread-rule h-px w-16 sm:w-24" />
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {SAMPLE_FILES.map((f, i) => (
              <PaperPanel
                key={f.code}
                tilt={f.tilt}
                pinned
                className="flex flex-col gap-3 transition-transform duration-200 hover:-translate-y-1 hover:rotate-0"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faded">
                    {f.code}
                  </span>
                  <TopSecretStamp
                    variant={f.stamp}
                    rotate={i % 2 === 0 ? 6 : -6}
                    className="text-[0.6rem] tracking-[0.12em]"
                  />
                </div>

                <h3 className="font-typewriter text-xl leading-tight text-ink">
                  {f.title}
                </h3>

                <p className="font-mono text-xs leading-relaxed text-paper-foreground/85">
                  {f.blurb} <RedactedText>{f.redacted}</RedactedText>
                  {f.tail}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-ink/15 pt-3 font-mono text-[10px] uppercase tracking-widest text-ink-faded">
                  <span>{f.watchers} watching</span>
                  <span>{f.pins} pins</span>
                </div>
              </PaperPanel>
            ))}
          </div>

          <p className="mt-12 text-center font-mono text-[11px] uppercase tracking-widest text-paper/70">
            All files are collaborative speculation. Take nobody&apos;s word for it —
            not even ours.
          </p>
        </div>
      </section>
    </>
  );
}
