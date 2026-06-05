# ROADMAP.md

Phased build. Each phase ships something verifiable. This is the living
checklist; the narrative log is in [PROGRESS.md](PROGRESS.md).

## Phase 0 — Foundations  ✅
- [x] Scaffold Next.js 16 + TS + Tailwind v4 + ESLint (App Router, npm)
- [x] shadcn/ui (base-nova) + base primitives
- [x] REDTHREAD theme: OKLCH tokens, textures, Special Elite + JetBrains Mono, CRT overlay
- [x] Themed components: RedactedText, TopSecretStamp, PaperPanel, CRTOverlay, Typewriter, ButtonLink
- [x] Themed landing ("Dispatches") + nav header/footer
- [x] Supabase clients (client/server/admin) + `proxy.ts` session refresh + env
- [x] Supabase init + first migrations (extensions, profiles + handle_new_user)
- [x] Docs suite + README + CLAUDE.md
- [x] `profiles` migration applied (`supabase db push`)
- [ ] Deploy to Vercel

## Phase 1 — Identity  ✅ (forum/board work moved into Phase 2)
- [x] Initiation flow (magic link, `auth/callback`, claim shadow_name)
- [x] Dossier page + rank ladder + `RankBadge`
- [x] Header auth state (component built; static header kept for now)

## Phase 2 — The Evidence Board  *(in progress — the differentiator)*
Includes the board/forum data layer (was the deferred Phase 1 slice).
- [ ] Schema: boards (+ plausibility/verdict/category/canon), nodes, edges, posts, votes, tags + RLS + triggers
- [ ] Boards: create, list/archive (ranked by plausibility), board view shell
- [ ] Board view = SSR dossier header + client `BoardCanvas` (`@xyflow/react`, `ssr:false`)
- [ ] Custom pin nodes per type; red-string SVG edges; add-pin / draw-string; persisted x/y/rotation
- [ ] PinInspector: node-level case-notes + Corroborate/Discredit (votes + credibility trigger)
- [ ] Realtime: presence rail, live pins/strings/notes, live cursors / "drawing string"
- [ ] `evidence` storage bucket + signed upload

## Phase 2.5 — Community & Comms  *(requested)*
- [x] **Forum / message board** — board-level case-notes thread (composer + nested replies + Corroborate/Discredit on posts); a "war room" discussion per case file.
- [ ] **Profile media** — avatar/banner upload (images + **small** gifs, size-capped) to a Supabase `avatars` bucket; shown on dossier, posts, presence.
- [x] **InMail** — discreet, async **1:1** messages (NOT live chat). `messages` table + RLS; a quiet inbox ("dead drops"), compose-to-shadow-name, read receipts. Intentionally understated, email-like.

## Phase 3 — The Wire
- [ ] Wire dashboard (Quakes/Flights/Events tabs)
- [ ] Route-handler proxies (USGS/OpenSky/GDELT) + caching + degraded states
- [ ] `signals` table + Vercel Cron snapshot
- [ ] MapLibre map of geo signals
- [ ] Pin-a-signal → node flow; NASA APOD

## Phase 4 — Archive / Search / Moderation / Polish
- [ ] Archive filters (tag/status/plausibility, COLD CASE/CLOSED stamps)
- [ ] Full-text search (tsvector GIN over boards+nodes)
- [ ] Reports flow + moderation queue (service-role, soft-delete/redact)
- [ ] Accessibility + reduced-motion pass; OG images; themed error/not-found
- [ ] Performance pass (`EXPLAIN ANALYZE`, index check)

## Phase 5 — Saturation / The Canon  *(needs Phase 2 engine)*
Populate REDTHREAD with real, curated content — our editorial spine.
- [ ] **Plausibility model** — every canon case file carries OUR rating (0–100) + a one-line **verdict**, sortable into a ranked archive.
- [ ] **Missing Scientists wing** *(top of the canon)* — dossiers for notable disappeared/mysteriously-dead scientists, each a board with a person pin, biographical facts (sourced), and competing **theory** pins wired with red string. Ranked at the very top.
- [ ] **Disappearances wing** — case files for famous vanishings (people, vessels, expeditions).
- [ ] **The ranked conspiracy canon** — notable conspiracies across domains, each weighed by plausibility with a verdict; the flagship "ranked by us" archive view.
- [ ] Research-backed for factual accuracy; everything framed as **collaborative speculation** per [SECURITY_AND_MODERATION.md](SECURITY_AND_MODERATION.md) (public/historical figures only, sourced, link-out not host).

## v2+ backlog
- [ ] pgvector "suggested connections" (Voyage/OpenAI embeddings — not Anthropic)
- [ ] FEC money-graph; Wikidata enrichment; NUFORC static import
- [ ] Notifications (realtime + email); achievements / clearance-gated abilities
