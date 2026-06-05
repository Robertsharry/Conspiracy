/** The Wire — normalized shape every source maps to before it hits the UI. */
export type WireSource = "usgs" | "opensky" | "gdelt" | "nasa";

export interface WireItem {
  source: WireSource;
  externalId: string;
  kind: string; // earthquake | flight | event | apod
  title: string;
  body: string | null;
  url: string | null;
  lat: number | null;
  lon: number | null;
  magnitude: number | null;
  occurredAt: string | null; // ISO
  metadata: Record<string, unknown>;
}

/** A feed result. `ok:false` → upstream failed; the UI shows a degraded state. */
export interface WireFeed {
  items: WireItem[];
  ok: boolean;
  note?: string;
}
