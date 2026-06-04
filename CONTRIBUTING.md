# CONTRIBUTING

Thanks for pulling the thread. Read [`CLAUDE.md`](CLAUDE.md) first — it has the
hard rules. This file covers workflow.

## Workflow

1. **Branch per feature** off `main` (e.g. `feat/evidence-board`, `fix/redaction-a11y`).
2. Keep changes scoped to one phase/concern where possible (see [`docs/ROADMAP.md`](docs/ROADMAP.md)).
3. Open a PR. The **Supabase GitHub app** spins up a preview database branch and
   applies any new `supabase/migrations/` to it — so schema changes are reviewed
   against a real DB. Vercel builds a preview deploy.
4. Verify locally (`npm run dev` + browser) and describe what you checked in the PR.

## Database changes

- Every schema change is a **new** timestamped migration in `supabase/migrations/`.
  Never edit an applied migration; never change the hosted DB by hand.
- One concern per file; put a phase's RLS policies together in one reviewable file.
- After changing schema, regenerate types (see [`docs/RUNBOOK.md`](docs/RUNBOOK.md)).
- New table with user data? It **must** have RLS enabled and policies in the same PR.

## Code conventions

- **npm only.** TypeScript everywhere. Server Components by default; `"use client"`
  only when needed.
- Reuse the theme: bespoke surfaces use `components/redthread/*` and the design
  tokens — don't reinvent paper/stamps/redaction. See [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md).
- User-facing copy follows the voice in [`docs/LORE.md`](docs/LORE.md) (in-world
  terms: Case File, Red String, Corroborate, …).
- TSDoc on exported functions/types and themed-component props.
- Accessibility is not optional: keyboard paths, accessible labels on decorative
  elements, and `prefers-reduced-motion` support.

## Commit messages

Conventional-ish: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`. Imperative mood.
Reference the phase where useful.

## The Protocols apply to code too

Don't add features that host leaked/classified documents or enable harassment of
real people. See [`docs/SECURITY_AND_MODERATION.md`](docs/SECURITY_AND_MODERATION.md).
