# 5. The Wire = route-handler proxies + a `signals` snapshot table

- **Status:** Accepted
- **Date:** 2026-06-04
- **Author:** Kairos

## Context
The Wire pulls from external public APIs with varying auth, rate limits, and
reliability (USGS keyless; GDELT slow cadence; OpenSky now OAuth2 + credit-capped).
Users pin a *signal* to a board, which must remain a stable reference even after
the live feed rolls the item off.

## Decision
External GETs go through **route handlers** (`app/api/wire/*/route.ts`), not Server
Actions — they're cacheable reads, keep keys/tokens server-side, and serve both the
dashboard and the map from one JSON endpoint. Caching is three-layered: (1) Next
`fetch` revalidate per source; (2) a **Vercel Cron** job snapshots top items into a
`signals` table; (3) light client polling only where freshness matters. Pinning a
signal upserts it into `signals` first, guaranteeing the node's FK target.

## Consequences
- Most Wire views never hit the DB; pins survive feed rollover and upstream
  outages; rate limits are absorbed by revalidate + last-good snapshot.
- One more table (`signals`) and a cron job to operate.
- Server Actions are reserved for mutations (pinning, voting, posting). Reference
  implementation: `lib/wire/sources/usgs.ts` + `app/api/wire/earthquakes/route.ts`.
