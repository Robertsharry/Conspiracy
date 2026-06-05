import type { Metadata } from "next";
import { PaperPanel } from "@/components/redthread/paper-panel";
import { TopSecretStamp } from "@/components/redthread/top-secret-stamp";

export const metadata: Metadata = { title: "The Wire" };

const FEEDS = [
  { code: "SEISMIC", source: "USGS", line: "Earthquakes, live. The 'they're shaking the ground' beat." },
  { code: "FLIGHTS", source: "OpenSky", line: "Aircraft in the sky right now. What WAS that plane?" },
  { code: "EVENTS", source: "GDELT", line: "The world's news as a firehose of incidents." },
  { code: "SKY", source: "NASA", line: "Near-earth objects and the image of the day." },
];

export default function WirePage() {
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
        <TopSecretStamp variant="classified" rotate={6} label="WIRING UP" />
      </div>

      <p className="mt-5 max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground">
        The watchtower. Real-world feeds, live — and any signal you catch can be
        pinned straight onto a board as evidence. A quake near the wrong place, a
        flight that drops off every tracker, an event that lines up too neatly.
        The world hands you the dots; you draw the string.
      </p>

      <div className="thread-rule my-8 h-px" />

      <div className="grid gap-6 sm:grid-cols-2">
        {FEEDS.map((f, i) => (
          <PaperPanel key={f.code} tilt={i % 2 ? 1 : -1} pinned className="flex flex-col">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faded">
                {f.code}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-redthread">
                via {f.source}
              </span>
            </div>
            <p className="mt-2 font-mono text-xs leading-relaxed text-paper-foreground/85">
              {f.line}
            </p>
            <p className="mt-3 border-t border-ink/15 pt-2 font-mono text-[10px] uppercase tracking-widest text-ink-faded">
              ▍ channel offline — wiring up
            </p>
          </PaperPanel>
        ))}
      </div>

      <p className="mt-10 text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        The Wire comes online in Phase 3. Stand by.
      </p>
    </div>
  );
}
