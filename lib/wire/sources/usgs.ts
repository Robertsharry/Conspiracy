import { z } from "zod";
import type { WireFeed, WireItem } from "../types";

/**
 * USGS earthquakes — the reference Wire source. Keyless GeoJSON, cached 60s.
 * Every other source follows this fetch → Zod-parse → normalize → degrade shape.
 */
const Schema = z.object({
  features: z.array(
    z.object({
      id: z.string(),
      properties: z.object({
        mag: z.number().nullable(),
        place: z.string().nullable(),
        time: z.number().nullable(),
        url: z.string().nullable(),
        title: z.string().nullable(),
      }),
      geometry: z.object({ coordinates: z.array(z.number()) }).nullable(),
    }),
  ),
});

const FEED =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson";

export async function fetchEarthquakes(limit = 18): Promise<WireFeed> {
  try {
    const res = await fetch(FEED, { next: { revalidate: 60 } });
    if (!res.ok) return { items: [], ok: false, note: `USGS ${res.status}` };
    const parsed = Schema.safeParse(await res.json());
    if (!parsed.success) return { items: [], ok: false, note: "USGS shape changed" };

    const items: WireItem[] = parsed.data.features
      .sort((a, b) => (b.properties.time ?? 0) - (a.properties.time ?? 0))
      .slice(0, limit)
      .map((f) => {
        const c = f.geometry?.coordinates ?? [];
        return {
          source: "usgs" as const,
          externalId: f.id,
          kind: "earthquake",
          title: f.properties.title ?? f.properties.place ?? "Seismic event",
          body: f.properties.place ?? null,
          url: f.properties.url ?? null,
          lat: typeof c[1] === "number" ? c[1] : null,
          lon: typeof c[0] === "number" ? c[0] : null,
          magnitude: f.properties.mag ?? null,
          occurredAt: f.properties.time
            ? new Date(f.properties.time).toISOString()
            : null,
          metadata: { depthKm: typeof c[2] === "number" ? c[2] : null },
        };
      });
    return { items, ok: true };
  } catch {
    return { items: [], ok: false, note: "USGS unreachable" };
  }
}
