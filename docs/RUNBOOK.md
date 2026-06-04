# RUNBOOK.md

Operational guide: environment, dev, migrations, deploy, and "it's on fire" fixes.

## Environment

Copy `.env.example` → `.env.local` and fill in. Keys:

| Var | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client+server | project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | client+server | safe in browser |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | optional | legacy JWT, some tooling |
| `SUPABASE_DB_PASSWORD` | local/CI | for `supabase db push` |
| `SUPABASE_SECRET_KEY` | server only | moderation/cron (Phase 3+); bypasses RLS |
| `NASA_API_KEY`, `OPENSKY_CLIENT_ID/SECRET` | server | The Wire (Phase 3) |

`.env*` is gitignored. Next loads `.env.local` at startup — restart the dev server
after editing it.

## Dev

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run lint
```

Verifying: the request log line shows a `proxy.ts:` timing when the auth proxy
ran. Drive the UI via the Preview/Chrome MCP and screenshot.

## Database migrations

Schema lives in `supabase/migrations/` as timestamped SQL. **Never** hand-edit the
hosted DB. Three ways to apply, in order of preference:

1. **Supabase GitHub app (preferred).** It's installed on this repo. Pushing
   migrations to GitHub applies them to a per-PR preview branch, and to production
   on merge to `main`. This is the intended GitOps flow.
2. **`supabase db push` (local, with login).**
   ```bash
   npx supabase login            # opens browser for a personal access token
   npx supabase link --project-ref fyxxjgwqwkfrnibzdasn
   npx supabase db push          # prompts for SUPABASE_DB_PASSWORD
   ```
3. **Local stack (needs Docker).** `npx supabase start` then
   `npx supabase db reset` — full local Postgres + Auth + Inbucket (great for
   testing magic links). Not available without Docker.

> Note: a direct `db push --db-url '…password…'` against production is
> intentionally avoided (puts credentials in shell history/transcripts and mutates
> prod without review). Use path 1 or 2.

Generate TypeScript types after schema changes:
```bash
npx supabase gen types typescript --linked > lib/database.types.ts
```

## Deploy (Vercel)

```bash
npx vercel link
npx vercel        # preview
npx vercel --prod # production
```
Set the same env vars in the Vercel dashboard. The Vercel Cron for
`/api/cron/refresh-signals` is configured in `vercel.json` (Phase 3).

## Troubleshooting

- **Whole site 500s after an env change** — `proxy.ts` runs Supabase on every
  request; a missing `NEXT_PUBLIC_SUPABASE_*` makes `createServerClient` throw.
  Check `.env.local` and restart.
- **Auth seems stale / user null in server code** — ensure you're calling
  `getClaims()` (not `getSession()`) and that `proxy.ts`'s matcher covers the route.
- **Realtime not firing** (Phase 2) — confirm the channel name, that RLS lets the
  user read the rows, and that the hook's cleanup isn't tearing the channel down on
  re-render. Leaked channels = the #1 footgun.
- **The Wire is empty** — expected on upstream outage/429; route handlers return a
  graceful degraded payload. Check the source's rate limit (esp. OpenSky credits).
- **shadcn component errors with `asChild`** — base-nova uses Base UI, not Radix.
  Use `ButtonLink` for links; use Base UI's `render` prop elsewhere.
