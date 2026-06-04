# PROGRESS.md — REDTHREAD build log

A running journal of what's been built, the key decisions, and what's next.
Updated at every checkpoint. The checkbox roadmap is in [ROADMAP.md](ROADMAP.md);
this is the narrative memory — read top entry first.

## Status at a glance
- **Current phase:** Phase 2 — The Evidence Board
- **Done:** Phase 0 · Phase 1 identity · Phase 2 schema + boards layer + canvas
- **Branch:** `phase-2-evidence-board` (carries Phase 0+1; PR reconciles `main`)
- **DB:** `profiles` applied. **New migrations (boards/nodes/edges/posts/votes/tags) need `supabase db push`** to bring the board to life.

---

## Log (newest first)

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
