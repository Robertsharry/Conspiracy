import { z } from "zod";
import type { WireFeed } from "../types";

/** NASA Astronomy Picture of the Day — free key, cached 1h. */
const Schema = z.object({
  date: z.string(),
  title: z.string(),
  explanation: z.string(),
  url: z.string(),
  hdurl: z.string().optional(),
  media_type: z.string(),
});

export async function fetchApod(): Promise<WireFeed> {
  const key = process.env.NASA_API_KEY ?? "DEMO_KEY";
  try {
    const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${key}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return { items: [], ok: false, note: `NASA ${res.status}` };
    const parsed = Schema.safeParse(await res.json());
    if (!parsed.success) return { items: [], ok: false, note: "NASA shape changed" };

    const a = parsed.data;
    return {
      ok: true,
      items: [
        {
          source: "nasa",
          externalId: a.date,
          kind: "apod",
          title: a.title,
          body: a.explanation,
          url: "https://apod.nasa.gov/apod/astropix.html",
          lat: null,
          lon: null,
          magnitude: null,
          occurredAt: new Date(a.date).toISOString(),
          metadata: {
            mediaType: a.media_type,
            image: a.media_type === "image" ? a.url : null,
          },
        },
      ],
    };
  } catch {
    return { items: [], ok: false, note: "NASA unreachable" };
  }
}
