# 2. Supabase as the backend, RLS-first

- **Status:** Accepted
- **Date:** 2026-06-04
- **Author:** Kairos

## Context
We need Postgres, auth, realtime, file storage, and a fast path to ship. The user
already provisioned a Supabase project and installed the Supabase GitHub app
(database branching per PR). Building a separate custom API tier would duplicate
auth/realtime and slow every phase.

## Decision
Supabase is the whole backend. Authorization is enforced in the database via Row
Level Security, not in a hand-rolled API layer. The Next.js app talks to Supabase
directly with three client trust levels (publishable browser/server clients +
a server-only service-role client). Mutations go through Server Actions; reads
through Server Components/route handlers. Schema is code in `supabase/migrations/`,
applied via the GitHub app.

## Consequences
- Less custom backend code; security lives next to the data and is testable via the
  client SDK.
- RLS correctness is critical — every user-data table needs policies and indexes on
  policy-referenced columns; we use the `(select auth.uid())` idiom for perf.
- We're coupled to Supabase conventions (`getClaims`, `@supabase/ssr` cookie
  handling, the secret/publishable key split). Documented in `CLAUDE.md`.
