# CLAUDE.md — REDTHREAD working notes

Context for any agent (or human) working in this repo. Read this first.

## What this is
REDTHREAD: a conspiracy-theory community where **the graph is the product**. The
core unit is a **Board** (case file) — a red-string corkboard of pinned evidence.
Forum = threaded *case-notes*. Votes = **Corroborate / Discredit**. See
[`README.md`](README.md) and [`docs/LORE.md`](docs/LORE.md).

Author/credit attribution in docs is **Kairos** (do not use other names).

## Stack & versions (verified June 2026)
- Next.js **16.2.7** (App Router, Turbopack default), React **19.2**, TypeScript 5.
- Tailwind **v4** (`@theme inline`, OKLCH). No `tailwind.config.ts` — tokens live in `app/globals.css`.
- shadcn/ui style is **base-nova**, built on **Base UI** (`@base-ui/react`), **not** Radix.
- `@supabase/ssr` + `@supabase/supabase-js`. `@xyflow/react` v12 (Phase 2). MapLibre (Phase 3).
- **Next 16 has breaking changes vs older versions.** When unsure of an API, consult the bundled docs in `node_modules/next/dist/docs/` and heed deprecation notices.

## Hard rules (these bite if ignored)
- **Package manager: npm only.** No pnpm/bun. Lockfile is `package-lock.json`.
- **Auth: use `supabase.auth.getClaims()` — never `getSession()`** in server code. Session refresh lives in `proxy.ts` → `lib/supabase/middleware.ts`.
- **Middleware is `proxy.ts`** (Next 16 renamed `middleware.ts` → `proxy.ts`; the function is `export function proxy()`). It runs on the Node.js runtime; no route-segment config allowed, but `export const config = { matcher }` is fine.
- **Buttons-as-links:** use `components/ui/button-link.tsx` (`<ButtonLink href=…>`). Base UI's `Button` does **not** support `asChild`; rendering it as an anchor triggers a `nativeButton` warning. `ButtonLink` styles a real `<Link>` with `buttonVariants`.
- **Three Supabase trust levels** in `lib/supabase/`: `client.ts` (browser, publishable key) · `server.ts` (cookies, publishable key) · `admin.ts` (service-role SECRET key, `import "server-only"`, never in a component).
- **Migrations** live in `supabase/migrations/` (timestamped). Never hand-edit the DB — the Supabase GitHub app applies migrations on push; locally use `supabase db push` (needs login). See `docs/RUNBOOK.md`.
- **RLS performance idiom:** write `(select auth.uid())` not `auth.uid()` so Postgres evaluates it once per query (initPlan), not per row.
- **Secrets:** `.env*` is gitignored. Publishable key is `NEXT_PUBLIC_*`; secret key is server-only. Never commit real keys.

## Where things live
```
app/                  routes (Server Components by default)
  page.tsx            "Dispatches" landing
  layout.tsx          fonts (Special Elite + JetBrains Mono), CRT overlay, providers
  globals.css         design tokens + texture utilities (theme source of truth)
components/
  ui/                 shadcn primitives (base-nova) + button-link.tsx
  redthread/          themed: redacted-text, top-secret-stamp, paper-panel,
                      crt-overlay, typewriter
  nav/                site-header, site-footer
lib/supabase/         client / server / admin / middleware (session refresh)
proxy.ts              Next 16 proxy — refreshes the auth session
supabase/migrations/  schema as timestamped SQL
docs/                 architecture, data model, design system, lore, etc.
```

## Conventions
- Server Components by default; add `"use client"` only when needed. The evidence board will be the only `ssr:false` island (Phase 2).
- Exported functions/types and themed-component props carry TSDoc.
- **Accessibility under the theme is non-negotiable:** stamps/redaction have accessible labels and keyboard operation; all motion honors `prefers-reduced-motion` (handled globally in `globals.css`). The "knowing wink" lives in copy, never in hiding what a control does.
- Tailwind custom color tokens (from `@theme inline`): `paper`, `paper-foreground`, `paper-aged`, `ink`, `ink-faded`, `cork`, `redthread`, `redthread-glow`, `stamp`, `ochre`, `pin`. Fonts: `font-typewriter`, `font-mono`. Texture utilities: `.paper-texture`, `.cork-texture`, `.crt-overlay`, `.thread-rule`.

## Verify a change
`npm run dev`, then drive the browser via the Preview/Chrome MCP tools and screenshot. Check server logs for SSR warnings — the `proxy.ts:` entry in request timing confirms the proxy ran.
