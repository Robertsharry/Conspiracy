# DESIGN_SYSTEM.md — the REDTHREAD aesthetic bible

This document is the source of truth for how REDTHREAD looks and feels. If a new
screen doesn't fit here, fix the screen or update this doc — never let the theme
drift. Tokens are defined in [`app/globals.css`](../app/globals.css).

## 1. Philosophy

Three layers, always in this relationship:

1. **The environment is a dim situation room** — warm near-black, vignetted, a
   faint CRT scanline. This is the chrome: nav, dialogs, the space *around*
   content.
2. **Content lives on aged-manila paper** pinned to a **cork board**. Documents
   are light; they sit *on top of* the dark room.
3. **The single accent is REDTHREAD red — the string.** Used sparingly: the
   wordmark's "RED", primary CTAs, focus rings, edges between pins, dividers.
   When everything is red, nothing is. Restraint is the whole point.

We are deliberately **not** the generic "dark mode + matrix rain + glowing green
terminal" conspiracy site. We are a declassified dossier that someone left open.

## 2. Color (OKLCH)

All colors are OKLCH for perceptual uniformity. shadcn/Base UI chrome uses the
standard tokens (`--background`, `--card`, …); bespoke components use the
REDTHREAD tokens below.

| Token | Value | Use |
|---|---|---|
| `--background` | `oklch(0.17 0.012 55)` | situation-room base |
| `--foreground` | `oklch(0.90 0.018 80)` | parchment text on dark |
| `--primary` / `--redthread` | `oklch(0.53 0.196–0.21 25)` | the string; primary CTA |
| `--paper` | `oklch(0.89 0.035 86)` | manila document surface |
| `--paper-foreground` / `--ink` | `oklch(0.26 0.03 58)` / `oklch(0.23 0.03 55)` | sepia ink on paper |
| `--ink-faded` | `oklch(0.42 0.03 60)` | metadata, captions on paper |
| `--cork` | `oklch(0.52 0.068 62)` | corkboard canvas |
| `--stamp` | `oklch(0.50 0.18 22)` | rubber-stamp ink (red) |
| `--ochre` | `oklch(0.72 0.12 72)` | secondary accent (EYES ONLY, highlights) |
| `--pin` | `oklch(0.60 0.16 40)` | push-pin heads |

Tailwind utilities are generated from these: `bg-paper`, `text-ink`,
`border-redthread`, `text-ochre`, `bg-pin`, etc. Opacity modifiers work
(`bg-ink/10`).

**Contrast:** dark text on paper, light text on cork/dark. Never paper-on-paper or
ink-on-cork (low contrast). Aim for WCAG AA on all body text.

## 3. Typography

Two faces, no more:

- **Special Elite** (`font-typewriter`, `--font-special-elite`) — display only:
  the wordmark, headings (`h1–h3`), stamps. Single weight (400). Often uppercase
  with positive tracking. It carries the voice; don't set body copy in it (poor
  long-form legibility).
- **JetBrains Mono** (`font-mono` / default `font-sans`, `--font-jetbrains`) —
  everything else: body, UI, labels, metadata, code. Monospace is intentional —
  it reads as "typed report / terminal."

Patterns: kicker labels are `font-mono text-[10–11px] uppercase tracking-widest
text-muted-foreground`. Case codes (`CASE-0447`) are `font-mono uppercase
tracking-widest text-ink-faded`.

## 4. Texture & atmosphere

Utilities in `globals.css`:

- `.paper-texture` — manila base + fractal-noise grain + subtle stains. Apply via
  `PaperPanel`, not directly.
- `.cork-texture` — the board canvas behind pins.
- `.crt-overlay` — fixed, non-interactive scanline + vignette + slow flicker;
  mounted once in `layout.tsx`. **Flicker is disabled under reduced-motion.**
- `.thread-rule` — a glowing 1px red divider that reads as taut string.

Use texture to set *place*, never to reduce legibility. Body text always sits on a
flat paper/dark fill, not on top of heavy noise.

## 5. Motion language

`motion` (Framer) arrives in Phase 2. The vocabulary:

- **Typewriter reveal** — headings/dispatches type in (`Typewriter`).
- **Stamp thunk** — stamps drop in with a small scale + settle (decorative).
- **String snap** — edges draw from source to target when a connection is made.
- **Pin lift** — cards lift/level on hover (`hover:-translate-y-1 hover:rotate-0`).

Every animation must no-op under `prefers-reduced-motion` (global rule already
zeroes durations; bespoke JS animations must check the media query too — see
`Typewriter`).

## 6. Component catalog (`components/redthread/`)

| Component | Kind | Purpose |
|---|---|---|
| `CRTOverlay` | server | the fixed scanline/vignette layer |
| `PaperPanel` | server | manila surface; props `tilt`, `pinned` |
| `TopSecretStamp` | server | rotated stamp; variants top-secret/classified/confidential/declassified/cold-case/eyes-only |
| `RedactedText` | client | ████ bar; reveal on click/Enter/Space; `aria-label` carries real text |
| `Typewriter` | client | types text out; reduced-motion → instant |
| `ButtonLink` (`ui/`) | server | a `<Link>` styled as a button (use for nav actions) |

## 7. Accessibility rules (hard requirements)

- Redaction: real text always in the DOM; control is keyboard-operable; announces
  "Redacted: …" while hidden.
- Stamps: decorative, but exposed via `aria-label` so meaning isn't lost.
- Motion: all of it honors `prefers-reduced-motion`.
- Empty/error/loading states are themed **and** informative (e.g. "THE WIRE IS
  QUIET — source unreachable, retrying"), never just flavor.
- Color is never the only signal (pair with label/icon).
