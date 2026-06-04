/**
 * Clearance rank ladder. Flavor + credibility — NOT a hard access gate in v1.
 * Display rank is derived from a profile's `credibility` so it responds
 * immediately to corroborations. The `profiles.rank` column is reserved for
 * future manual overrides. See docs/LORE.md.
 */

export type RankKey =
  | "sheeple"
  | "awakened"
  | "researcher"
  | "watchman"
  | "handler"
  | "architect";

export interface Rank {
  key: RankKey;
  label: string;
  /** Minimum credibility to hold this rank. */
  min: number;
  blurb: string;
}

export const RANKS: Rank[] = [
  { key: "sheeple", label: "Sheeple", min: 0, blurb: "Still asleep." },
  { key: "awakened", label: "Awakened", min: 10, blurb: "Starting to see it." },
  { key: "researcher", label: "Researcher", min: 50, blurb: "Doing the work." },
  { key: "watchman", label: "Watchman", min: 150, blurb: "Trusted eyes." },
  { key: "handler", label: "Handler", min: 400, blurb: "Runs the wall." },
  { key: "architect", label: "Architect", min: 1000, blurb: "Sees the whole board." },
];

/** The highest rank whose threshold the credibility meets. */
export function rankForCredibility(credibility: number): Rank {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (credibility >= rank.min) current = rank;
  }
  return current;
}

/** The next rank up, or null at the top. */
export function nextRank(credibility: number): Rank | null {
  return RANKS.find((r) => r.min > credibility) ?? null;
}
