# ROADMAP.md

Phased build. Each phase ships something verifiable. Full rationale in the
approved plan; this is the living checklist.

## Phase 0 — Foundations  *(in progress)*
- [x] Scaffold Next.js 16 + TS + Tailwind v4 + ESLint (App Router, npm)
- [x] shadcn/ui (base-nova) + base primitives
- [x] REDTHREAD theme: OKLCH tokens, textures, Special Elite + JetBrains Mono, CRT overlay
- [x] Themed components: RedactedText, TopSecretStamp, PaperPanel, CRTOverlay, Typewriter, ButtonLink
- [x] Themed landing ("Dispatches") + nav header/footer
- [x] Supabase clients (client/server/admin) + `proxy.ts` session refresh + env
- [x] Supabase init + first migrations (extensions, profiles + handle_new_user)
- [x] Docs suite (this folder) + README + CLAUDE.md
- [ ] Apply migrations to the DB (via Supabase GitHub app on push, or `supabase db push`)
- [ ] Deploy to Vercel

## Phase 1 — Identity + Forum
- [ ] Initiation flow (magic link, `auth/callback`, claim shadow_name)
- [ ] Dossier page + rank ladder + `RankBadge`
- [ ] Board create + list/archive
- [ ] Case-notes threads (posts CRUD + nested replies)
- [ ] Votes (Corroborate/Discredit) + score/credibility triggers
- [ ] RLS for profiles/boards/posts/votes

## Phase 2 — The Evidence Board + Realtime  *(the differentiator)*
- [ ] Board view = SSR dossier header + client `BoardCanvas` (`@xyflow/react`, `ssr:false`)
- [ ] Custom pin nodes per type; red-string SVG edges
- [ ] Add-pin / draw-string toolbar; persisted x/y/rotation
- [ ] PinInspector with node-level case-notes
- [ ] Realtime: presence rail, live pins/strings/notes, live cursors / "drawing string"
- [ ] `evidence` storage bucket + signed upload

## Phase 3 — The Wire
- [ ] Wire dashboard (Quakes/Flights/Events tabs)
- [ ] Route-handler proxies (USGS/OpenSky/GDELT) + caching + degraded states
- [ ] `signals` table + Vercel Cron snapshot
- [ ] MapLibre map of geo signals
- [ ] Pin-a-signal → node flow; NASA APOD

## Phase 4 — Archive / Search / Moderation / Polish
- [ ] Archive filters (tag/status/sort, COLD CASE/CLOSED stamps)
- [ ] Full-text search (tsvector GIN over boards+nodes)
- [ ] Reports flow + moderation queue (service-role, soft-delete/redact)
- [ ] Accessibility + reduced-motion pass; OG images; themed error/not-found
- [ ] Performance pass (`EXPLAIN ANALYZE`, index check); seed polish

## v2+ backlog
- [ ] pgvector "suggested connections" (Voyage/OpenAI embeddings — not Anthropic)
- [ ] FEC money-graph; Wikidata enrichment; NUFORC static import
- [ ] Notifications (realtime + email); achievements / clearance-gated abilities
