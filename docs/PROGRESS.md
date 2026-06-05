# PROGRESS.md — REDTHREAD build log

A running journal of what's been built, the key decisions, and what's next.
Updated at every checkpoint. The checkbox roadmap is in [ROADMAP.md](ROADMAP.md);
this is the narrative memory — read top entry first.

## Status at a glance
- **Current phase:** Phase 4 polish (search, moderation, themed errors) + **@mentions/Intercepts** done. Remaining: **The Wire** (Phase 3 live data).
- **Done:** Phase 0 · Phase 1 · Phase 2 (board+inspector+votes+realtime) · Phase 2.5 (forum, InMail, profile media) · dossier · **Phase 5 Canon** · Donate (Black Budget) · **loading states everywhere** · **Phase 4** (full-text search, flag-for-review + moderation queue, themed 404/error) · **@mention/tag + Intercepts (notifications)**
- **Workflow:** branch → commit → PR → **merge to `main`** (per user). PRs #3–#15 merged.
- **DB:** apply on merge / `supabase db push` — recent: `supporters`, `roanoke_solved`, `active_files_seed`, `cicada_reframe`, `search`, `reports`, `notifications`. **Canon + these need `db push`.**
- **Prod (`redthread.red`):** needs Vercel env vars set; then it tracks `main`.

---

### 2026-06-04 — @mention / tag + Intercepts
`notifications` table written **only** by a SECURITY DEFINER trigger that parses
`@shadow_name` mentions and reply-targets on every new post (no client insert →
unforgeable; RLS lets you read/mark-read only your own). `MentionTextarea` adds
**@ autocomplete** (operative search) to the case-note composer; `MentionedText`
renders handles as dossier links. Header **bell** (lucide) shows the unread count
for signed-in operatives → **`/pings`** ("Intercepts"), with mark-all-read and a
Decrypting loader. **Verify:** anon `/pings` redirects to initiation (confirmed);
build green. Needs `db push` + login to exercise the trigger.

### 2026-06-04 — Phase 4: search + moderation + themed errors
**Full-text search** (`search_tsv` generated tsvector + GIN on boards & nodes;
`searchArchive` via `websearch` tsquery, RLS-scoped) at **`/search`** with a header
icon. **Flag-for-review**: `reports` table (insert-only RLS, service-role triage),
`fileReport` action + `FlagButton` on boards and case-notes. Themed **404**
(EXPUNGED stamp) and **error** ("Signal Lost", retry) pages. All verified
in-browser; build green. (PRs #14, #15.)

---

### 2026-06-04 — Phase 5: The Canon (seeded)
Research-backed `canon_seed` migration: **21 curated case files** (`is_canon`,
`created_by=null`), each with our **plausibility** rating + dry **verdict**.
**Missing Scientists** (Olson/Bull/Kelly/Diesel) fully built — person/event/theory
pins wired with **red string**, featured at the top. **Disappearances** wing
(Cooper, Mary Celeste, Roanoke, Earhart, Flight 19). **Conspiracies ranked by
plausibility** (MKUltra/COINTELPRO/Tuskegee/Northwoods = 100 → moon-hoax = 2),
documented-fact-vs-labeled-speculation. Two solved homicides on the popular "dead
scientists" list **excluded** (real living families). Boards archive now sectioned
(Missing Scientists / Disappearances / The Canon / Recent). Sourced via a research
pass (Wikipedia/Britannica/CDC/NSA/FBI/NOAA/etc.).
**Verify:** `supabase db push`, then `/boards` shows the populated, ranked archive.

---

## Log (newest first)

### 2026-06-04 — Phase 2 realtime + dossier reachable
**Realtime board:** `nodes/edges/posts` added to the `supabase_realtime` publication;
per-board **presence rail** (who's watching, color-ringed avatars) + **live pins/
strings** via `postgres_changes` INSERT (optimistic adds dedupe vs the realtime
echo); `colorFor(id)` presence colors. **Cursors deferred** (fragile coord-mapping;
follow-up). **Dossier reachable:** header `AuthStatus` chip (avatar + shadow name →
dossier + exit) restored/upgraded; author names link to dossiers across forum + pin
notes. Earlier this session also: forum, InMail, profile media, and the dossier
panels wired to live data — all merged.
**Next:** The Canon (ranked conspiracies; missing scientists at the top).

### 2026-06-04 — Phase 2.5 complete: InMail + profile media
**InMail** (PR #4): `messages` + RLS (parties read / sender writes / recipient
marks read), inbox + conversation + compose, nav link + dossier "Send InMail";
discreet, email-like, async. **Profile media**: `avatars` storage bucket + RLS,
`AvatarUploader` (≤2MB; png/jpg/webp/gif via `unoptimized` next/image so gifs
animate), `Avatar` with initials fallback on the dossier; next.config
remotePatterns for `*.supabase.co`. Workflow is now branch → commit → PR → merge.
**Next:** Realtime on the board (presence + live pins/strings + cursors), then
the Canon (missing scientists ranked at the top).

### 2026-06-04 — Phase 2.5: forum + deploy/UX fixes
Per-case-file **Case Notes** thread (board-level posts + nested replies +
Corroborate/Discredit), mounted under the board canvas; optimistic + anon-gated.
Also: **deploy hardening** (proxy skips session refresh when Supabase env is
absent, so a misconfigured Vercel target no longer 500s the whole site), legible
**@xyflow controls/minimap** on the dark board, and stored NASA + Resend keys.
User confirmed **signup works live** (Resend SMTP) and pushed **all migrations**.
Roadmapped Phase 2.5 (forum ✓, profile media, InMail).
**Next:** profile media + InMail; realtime; then the Canon.

### 2026-06-04 — Phase 2: board engine (schema + boards + canvas)
Board/forum schema: `boards` (with plausibility/verdict/category/is_canon/
featured_rank), `nodes`, `edges`, `posts`, `votes`, `tags` + RLS (one file) +
`apply_vote` credibility trigger + count triggers + `can_read_board`. Boards data
layer + create action; ranked **archive** (canon by plausibility + recent) +
create form + board **view**. Evidence board **canvas** (`@xyflow/react`): manila
pin nodes, red-string edges, pan/zoom, add-pin toolbar, drag-to-connect, optimistic
persistence, `ssr:false` + DECRYPTING placeholder. Build green; archive verified
in-browser (graceful empty states pre-migration). Also: stacked-PR fix (Phase 1
had landed in `phase-0-foundations`, not `main`) and added **Phase 5 — Saturation /
The Canon** to the roadmap (missing scientists ranked at the top).
**Pending:** push the new migrations, then verify the live board (pins + string).

### 2026-06-04 — Phase 1: identity slice
Magic-link **initiation** (`/initiation`), **shadow-name claim** (validated +
uniqueness-guarded), **rank ladder** + `RankBadge` (derived from credibility),
**dossier** (`/dossier/[shadow_name]`), and header **AuthStatus**. Production
build green; initiation UI verified in-browser (console clean). Committed on
`phase-1-identity`.
**Pending:** apply migrations + allowlist `http://localhost:3000/**` in Supabase
Auth to exercise the full sign-in → claim → dossier loop.

### 2026-06-04 — Phase 0: foundations
Scaffolded Next.js 16 + Tailwind v4 + shadcn (base-nova) + Supabase. Built the
declassified theme (OKLCH tokens, paper/cork/CRT textures, Special Elite +
JetBrains Mono), the themed component library, the "Dispatches" landing, the
three-tier Supabase clients + `proxy.ts`, the `profiles` migration, and the full
docs suite. Build green; landing + case-files verified in-browser. Committed on
`phase-0-foundations`.
**Key finds baked into the codebase/docs:**
- shadcn *base-nova* uses **Base UI** (not Radix) → use `ButtonLink` for links.
- Next 16 uses **`proxy.ts`** (not `middleware.ts`); function is `proxy()`.
- OpenSky moved to **OAuth2** (2026-03-18) — treated as P0-with-optional-creds.

---

## Next up
**Boards + Forum + Votes** (the social layer): forum migrations
(boards/posts/votes/tags + RLS + `apply_vote` credibility trigger), board
create/list/archive, threaded case-notes with replies, and the
Corroborate/Discredit bar.
