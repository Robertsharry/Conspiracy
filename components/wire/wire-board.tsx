"use client";

import { useState } from "react";
import { Activity, Plane, Globe, Sparkles } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { pinSignal } from "@/lib/actions/wire-actions";
import type { WireFeed, WireItem } from "@/lib/wire/types";
import { cn } from "@/lib/utils";

export interface WireFeedsProp {
  quakes: WireFeed;
  flights: WireFeed;
  events: WireFeed;
  apod: WireFeed;
}

type PinStatus = "idle" | "pinning" | "done" | "error";

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const s = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

function magClass(m: number | null): string {
  if (m == null) return "text-muted-foreground";
  if (m >= 6) return "text-redthread";
  if (m >= 4.5) return "text-ochre";
  return "text-foreground";
}

const SOURCE_LABEL: Record<string, string> = {
  usgs: "USGS",
  opensky: "OpenSky",
  gdelt: "GDELT",
  nasa: "NASA",
};

/**
 * WireBoard — the live dashboard. Tabs over the four channels; each card can be
 * pinned to the selected board (→ a `signal` node, pushed live via realtime).
 */
export function WireBoard({
  feeds,
  boards,
  canPin,
}: {
  feeds: WireFeedsProp;
  boards: { id: string; title: string }[];
  canPin: boolean;
}) {
  const [target, setTarget] = useState(boards[0]?.id ?? "");
  const [status, setStatus] = useState<Record<string, PinStatus>>({});
  const canActuallyPin = canPin && boards.length > 0;

  async function pin(item: WireItem) {
    const key = `${item.source}:${item.externalId}`;
    setStatus((s) => ({ ...s, [key]: "pinning" }));
    const res = await pinSignal({ boardId: target, item });
    setStatus((s) => ({ ...s, [key]: "error" in res ? "error" : "done" }));
  }

  const channels = [
    { value: "quakes", label: "Seismic", icon: Activity, feed: feeds.quakes },
    { value: "flights", label: "Flights", icon: Plane, feed: feeds.flights },
    { value: "events", label: "Events", icon: Globe, feed: feeds.events },
    { value: "apod", label: "Sky", icon: Sparkles, feed: feeds.apod },
  ] as const;

  return (
    <div className="space-y-5">
      {/* Pin target */}
      {canActuallyPin ? (
        <label className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Pin target
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="rounded-sm border border-input bg-background px-2 py-1 font-mono text-xs normal-case tracking-normal text-foreground outline-none focus-visible:ring-1 focus-visible:ring-redthread"
          >
            {boards.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          {canPin
            ? "Open a case file first — then you can pin signals to it."
            : "Initiate to pin signals onto your boards."}
        </p>
      )}

      <Tabs defaultValue="quakes">
        <TabsList variant="line" className="flex-wrap">
          {channels.map((c) => (
            <TabsTrigger
              key={c.value}
              value={c.value}
              className="font-mono text-[11px] uppercase tracking-widest"
            >
              <c.icon className="size-3.5" /> {c.label}
              <span className="ml-1 text-muted-foreground">
                {c.feed.ok ? c.feed.items.length : "—"}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {channels.map((c) => (
          <TabsContent key={c.value} value={c.value} className="pt-5">
            <ChannelBody
              feed={c.feed}
              canPin={canActuallyPin}
              status={status}
              onPin={pin}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function ChannelBody({
  feed,
  canPin,
  status,
  onPin,
}: {
  feed: WireFeed;
  canPin: boolean;
  status: Record<string, PinStatus>;
  onPin: (item: WireItem) => void;
}) {
  if (!feed.ok) {
    return (
      <div className="rounded-sm border border-dashed border-border/70 px-4 py-12 text-center">
        <p className="font-typewriter text-xl uppercase tracking-widest text-muted-foreground">
          The Wire is quiet
        </p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground/70">
          channel down{feed.note ? ` — ${feed.note}` : ""}. it happens.
        </p>
      </div>
    );
  }
  if (feed.items.length === 0) {
    return (
      <p className="font-mono text-sm text-muted-foreground">
        Nothing on this channel right now.
      </p>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {feed.items.map((item) => (
        <SignalCard
          key={`${item.source}:${item.externalId}`}
          item={item}
          canPin={canPin}
          status={status[`${item.source}:${item.externalId}`] ?? "idle"}
          onPin={onPin}
        />
      ))}
    </div>
  );
}

function SignalCard({
  item,
  canPin,
  status,
  onPin,
}: {
  item: WireItem;
  canPin: boolean;
  status: PinStatus;
  onPin: (item: WireItem) => void;
}) {
  const ago = timeAgo(item.occurredAt);
  return (
    <div className="flex flex-col rounded-sm border border-border bg-card/50 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-redthread">
          {SOURCE_LABEL[item.source] ?? item.source}
        </span>
        {ago && (
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
            {ago}
          </span>
        )}
      </div>

      {item.url ? (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 font-typewriter text-sm text-foreground hover:text-redthread"
        >
          {item.title}
        </a>
      ) : (
        <span className="mt-1 font-typewriter text-sm text-foreground">
          {item.title}
        </span>
      )}

      {item.body && item.kind !== "earthquake" && (
        <p className="mt-1 line-clamp-2 font-mono text-xs text-muted-foreground">
          {item.body}
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {item.magnitude != null && (
          <span className={magClass(item.magnitude)}>
            M{item.magnitude.toFixed(1)}
          </span>
        )}
        {item.lat != null && item.lon != null && (
          <span>
            {item.lat.toFixed(2)}, {item.lon.toFixed(2)}
          </span>
        )}
        {typeof item.metadata.country === "string" && (
          <span>{item.metadata.country}</span>
        )}
      </div>

      <div className="mt-3 border-t border-border/60 pt-2">
        {status === "done" ? (
          <span className="font-mono text-[10px] uppercase tracking-widest text-ochre">
            pinned to board ✓
          </span>
        ) : canPin ? (
          <button
            type="button"
            onClick={() => onPin(item)}
            disabled={status === "pinning"}
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-redthread disabled:opacity-50"
          >
            {status === "pinning" ? "pinning…" : "⌖ pin to board"}
          </button>
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
            pin: initiate first
          </span>
        )}
        {status === "error" && (
          <span className="ml-2 font-mono text-[10px] text-destructive">
            could not pin
          </span>
        )}
      </div>
    </div>
  );
}
