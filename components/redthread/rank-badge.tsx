import { cn } from "@/lib/utils";
import { rankForCredibility } from "@/lib/ranks";

/**
 * RankBadge — a clearance-level chip derived from a profile's credibility.
 *
 * @param credibility net corroborations on the operative's contributions.
 */
export function RankBadge({
  credibility,
  className,
}: {
  credibility: number;
  className?: string;
}) {
  const rank = rankForCredibility(credibility);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border border-ochre/40 bg-ochre/10 px-2 py-0.5",
        "font-mono text-[10px] uppercase tracking-widest text-ochre",
        className,
      )}
      title={rank.blurb}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-ochre" />
      clearance: {rank.label}
    </span>
  );
}
