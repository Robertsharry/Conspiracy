# API_INTEGRATIONS.md — The Wire

External public-data sources that feed **The Wire** (Phase 3). Users can pin any
*signal* to a board as evidence. All sources are free. Keys (where needed) stay
server-side; the browser only ever hits our `app/api/wire/*` route handlers.

## Sources

| Source | Endpoint | Auth | Limits | Cache (revalidate) | Feeds |
|---|---|---|---|---|---|
| **USGS earthquakes** | `earthquake.usgs.gov/earthquakes/feed/v1.0/summary/*.geojson` | none | generous | 60s | quakes map ("HAARP" angle) |
| **GDELT** | `api.gdeltproject.org/api/v2/doc/doc` (+ geo) | none | ~1 req/5s | 900s | global events timeline |
| **OpenSky** | `opensky-network.org/api/states/all` (bbox) | ⚠️ OAuth2 client-credentials since **2026-03-18** | anon ≈400 credits/day, current-data only | 30–60s | live flights ("what was that plane") |
| **NASA APOD/NEO** | `api.nasa.gov` | free key (`NASA_API_KEY`, `DEMO_KEY` ok) | 1000/hr | 1h | space imagery, near-earth objects |
| **FEC** | `api.open.fec.gov/v1` | optional free key | 1000/hr | 1h+ | follow-the-money (v2) |
| **Wikipedia/Wikidata** | `*.wikipedia.org/w/api.php`, `query.wikidata.org` | none | generous | 1d | entity context for person/event pins |

### OpenSky note (important)
OpenSky moved to OAuth2 client-credentials on 2026-03-18. We treat it as
**P0-with-optional-credentials**: works keyless for demos but capped. The server
source (`lib/wire/sources/opensky.ts`) caches an OAuth token in memory when
`OPENSKY_CLIENT_ID/SECRET` are set; otherwise it uses a **bounded bbox** query
(never global `/states/all`) with a longer revalidate to stay under the daily
credit budget. On 429 → serve the last-good `signals` snapshot + a themed degraded
state.

## Caching strategy (three layers)

1. **Next `fetch` revalidate** on the upstream call (TTLs above) — most Wire views
   never touch the DB.
2. **`signals` table snapshot** via Vercel Cron (`/api/cron/refresh-signals`,
   every 5–15 min) — gives "pin a signal" a durable FK target and survives
   upstream outages.
3. **Light client polling** only where freshness matters (the live map).

Reference implementation: `lib/wire/sources/usgs.ts` (fetch → Zod-parse →
normalize to a shared `Signal` shape) + `app/api/wire/earthquakes/route.ts`. Every
other source copies this shape.

## Pin-a-signal flow

`SignalCard` → choose board → `pinSignal()` server action: confirm auth
(`getClaims`), upsert the signal into `signals` (guarantees the FK), insert a
`type='signal'` node, `revalidatePath`. Realtime then pushes the new pin to anyone
watching that board.

## Deliberately NOT integrated (link-out only)

FOIA/declassified sources — **CIA Reading Room, FBI Vault, NARA** — have no usable
APIs and we do **not** host their documents. Person/document pins citing them use
`source_url` to **link out**. NUFORC UFO data has no live API; planned as a static
dataset import (v2). See [`SECURITY_AND_MODERATION.md`](SECURITY_AND_MODERATION.md)
for the host-vs-link policy.

## Embeddings (v2)
For "suggested connections," use **Voyage AI** (Anthropic-recommended) or OpenAI
`text-embedding-3-small`. **Anthropic has no embeddings endpoint** — do not write
`anthropic.embeddings.create`.
