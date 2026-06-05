import { z } from "zod";
import type { WireFeed, WireItem } from "../types";

/** GDELT global news firehose — keyless, cached 15 min. */
const Schema = z.object({
  articles: z
    .array(
      z.object({
        url: z.string(),
        title: z.string(),
        seendate: z.string().optional(),
        domain: z.string().optional(),
        sourcecountry: z.string().optional(),
      }),
    )
    .optional(),
});

const QUERY = encodeURIComponent(
  '(declassified OR "cover-up" OR whistleblower OR UAP OR FOIA OR surveillance)',
);
const FEED = `https://api.gdeltproject.org/api/v2/doc/doc?query=${QUERY}&mode=ArtList&maxrecords=18&format=json&sort=DateDesc`;

/** GDELT seendate is `YYYYMMDDTHHMMSSZ`. */
function parseSeen(s?: string): string | null {
  if (!s || s.length < 15) return null;
  const iso = `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}T${s.slice(9, 11)}:${s.slice(11, 13)}:${s.slice(13, 15)}Z`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export async function fetchEvents(): Promise<WireFeed> {
  try {
    const res = await fetch(FEED, { next: { revalidate: 900 } });
    if (!res.ok) return { items: [], ok: false, note: `GDELT ${res.status}` };
    const parsed = Schema.safeParse(await res.json());
    if (!parsed.success) return { items: [], ok: false, note: "GDELT shape changed" };

    const items: WireItem[] = (parsed.data.articles ?? []).map((a) => ({
      source: "gdelt" as const,
      externalId: a.url,
      kind: "event",
      title: a.title,
      body: [a.domain, a.sourcecountry].filter(Boolean).join(" · ") || null,
      url: a.url,
      lat: null,
      lon: null,
      magnitude: null,
      occurredAt: parseSeen(a.seendate),
      metadata: { domain: a.domain ?? null, country: a.sourcecountry ?? null },
    }));
    return { items, ok: true };
  } catch {
    return { items: [], ok: false, note: "GDELT unreachable" };
  }
}
