# REDTHREAD

> **Pull the thread.**
> A conspiracy-theory community where the **graph is the product** — pin the
> evidence, draw the red string between the dots, and let the pattern reveal
> itself.

REDTHREAD is not a forum with a graph bolted on. The core unit is a **Board** (a
case file): a pannable, zoomable corkboard where the community pins evidence
(theories, people, events, documents, media, and live real-world *signals*) and
connects them with **red string**. The classic message board lives as threaded
*case-notes* attached to every board and every pin. Voting is reframed as
**Corroborate / Discredit**.

The whole thing wears a **declassified case-file** aesthetic: Special Elite
typewriter type, redacted ████ bars you can lift, TOP SECRET stamps, polaroids
pinned at angles, and a faint CRT scanline over a dim situation-room dark.

---

## The four pillars

1. **Identity** — open + pseudonymous. Pick a *shadow name*, climb a *clearance
   rank* ladder (flavor, not a hard gate). Magic-link auth under the hood.
2. **The Forum** — threaded case-notes on boards and pins; Corroborate/Discredit.
3. **The Evidence Board** — the differentiator: an interactive red-string
   corkboard (`@xyflow/react`) with realtime presence, live pins, and ghost
   cursors.
4. **The Wire** — a live dashboard of real public-data APIs (earthquakes,
   flights, global events) you can pin to a board as evidence.

See [`docs/ROADMAP.md`](docs/ROADMAP.md) for the phased build.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) · React 19 · TypeScript |
| Styling | Tailwind v4 (OKLCH tokens) · shadcn/ui (base-nova / Base UI) · `motion` |
| Evidence board | `@xyflow/react` v12 (client island) |
| Maps | MapLibre GL JS |
| Backend | Supabase — Postgres · Auth (`@supabase/ssr`) · Realtime · Storage · RLS |
| Deploy | Vercel + the Supabase GitHub app (DB branching per PR) |

---

## Quickstart

```bash
# 1. Install (npm only — see CLAUDE.md)
npm install

# 2. Configure environment
cp .env.example .env.local        # then fill in Supabase values

# 3. Apply database migrations (choose one — see docs/RUNBOOK.md)
#    a) push to GitHub  → the Supabase GitHub app applies them, or
#    b) supabase db push  (with your Supabase login)

# 4. Run
npm run dev                        # http://localhost:3000
```

---

## Documentation

Documentation is a first-class deliverable. Start here:

- [`CLAUDE.md`](CLAUDE.md) — conventions & where things live (humans and agents)
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system overview
- [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) — schema, enums, RLS
- [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) — the aesthetic bible
- [`docs/LORE.md`](docs/LORE.md) — the in-universe canon & tone guide
- [`docs/API_INTEGRATIONS.md`](docs/API_INTEGRATIONS.md) — The Wire's data sources
- [`docs/SECURITY_AND_MODERATION.md`](docs/SECURITY_AND_MODERATION.md) — RLS & The Protocols
- [`docs/RUNBOOK.md`](docs/RUNBOOK.md) — ops & troubleshooting
- [`docs/adr/`](docs/adr/) — architecture decision records

---

*Compiled by **Kairos**. We shadow our names, for they are watching.*
