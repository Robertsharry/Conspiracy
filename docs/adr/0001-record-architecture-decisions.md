# 1. Record architecture decisions

- **Status:** Accepted
- **Date:** 2026-06-04
- **Author:** Kairos

## Context
REDTHREAD makes several non-obvious technical choices (RLS-first backend, a
client-only graph canvas, a specific caching pipeline). Future contributors —
human and agent — need to know *why*, not just *what*, to avoid relitigating or
accidentally undoing decisions.

## Decision
We keep lightweight Architecture Decision Records in `docs/adr/`, one per
significant decision, numbered sequentially. Each records Context, Decision, and
Consequences. ADRs are immutable once accepted; a reversal is a new ADR that
supersedes the old one.

## Consequences
- A small writing cost per decision, paid back in onboarding clarity.
- `CLAUDE.md` points here; PRs that change architecture should add or update an ADR.
