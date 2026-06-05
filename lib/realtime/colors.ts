/** A small, legible palette for per-operative presence/cursor colors. */
const PALETTE = [
  "#e5484d", // red
  "#f5a524", // amber
  "#3e9b4f", // green
  "#3b82f6", // blue
  "#a855f7", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
  "#eab308", // gold
];

/** Deterministic color for an operative id (stable across sessions). */
export function colorFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
