<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version (Next.js 16) has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices. (Notably: `middleware.ts` is now `proxy.ts`.)
<!-- END:nextjs-agent-rules -->

# REDTHREAD project guidance

Full conventions and architecture notes live in **[`CLAUDE.md`](CLAUDE.md)** —
read it before making changes. It covers the stack, hard rules (npm-only,
`getClaims`, the `proxy.ts`/`ButtonLink` patterns, Supabase trust levels, the RLS
idiom), and where everything lives.
