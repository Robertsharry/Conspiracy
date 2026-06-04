# SECURITY_AND_MODERATION.md

REDTHREAD plays a conspiracy theme for fun. That makes responsible security and
moderation **first-class**, not an afterthought.

## Auth & sessions

- Magic-link (passwordless) via `@supabase/ssr`. Pseudonymous: users pick a
  *shadow name*; email is only for auth.
- Session cookies are refreshed in `proxy.ts` on every request.
- **Authorize with `supabase.auth.getClaims()`** (validates the JWT), never
  `getSession()`, in server code.

## Key model

- **Publishable key** (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) is safe in the
  browser — security is enforced by RLS, not key secrecy.
- **Secret key** (`SUPABASE_SECRET_KEY`) is server-only (`lib/supabase/admin.ts`,
  `import "server-only"`), bypasses RLS, and is used only for moderation + cron.
- `.env*` is gitignored; `.env.example` carries no values. Never commit real keys.

## Row Level Security

RLS is the backbone (see [`DATA_MODEL.md`](DATA_MODEL.md)): default-deny, world-
readable public boards, owner-write, auth-required inserts, votes scoped to self,
`signals`/`tags` server-write-only. Index every policy-referenced column and use
the `(select auth.uid())` idiom. Test policies through the client SDK, **not** the
SQL editor (which bypasses RLS).

## The Protocols (house rules)

In-world name for our content policy. Surfaced at initiation and linked in the
footer. The theme is theatrical; the harm is real if we're careless.

**Not allowed**
- Doxxing or harassment of real, living, private individuals. Person pins are for
  **public/historical figures** and must carry sourcing (`source_url`).
- Hosting "leaked"/classified documents. We **link out**, never host (also covers
  copyright). See [`API_INTEGRATIONS.md`](API_INTEGRATIONS.md).
- Calls to violence, hate, or real-world harm; medical/voting disinfo framed as
  actionable fact.
- Spam, scams, malware links.

**Framing**
- All content is **collaborative speculation**, labeled as such. The tone is a
  knowing wink, not a recruitment pitch (see [`LORE.md`](LORE.md)).

## Moderation flow

- **Flag for review** on any board/pin/string/note → `reports` queue.
- Soft-delete / **redact** (never silent hard-delete) — content shows as ████ and
  is preserved for audit (and the lore: nothing is truly gone). v1 moderation runs
  through service-role server actions; v2 adds an `is_moderator()` claim.
- New-account rate limits on posting to blunt spam/brigading.
- Clearance rank is flavor — **never** a shield against moderation.

## Reporting a vulnerability

Found a security issue? Don't open a public issue. Contact the maintainer
(**Kairos**) privately. (Wire up a real channel before any public launch.)
