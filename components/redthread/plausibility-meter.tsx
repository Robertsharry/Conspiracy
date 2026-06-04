import { cn } from "@/lib/utils";

/** Our editorial verdict tiers for a 0–100 plausibility rating. */
export function plausibilityTier(value: number): string {
  if (value >= 80) return "Compelling";
  if (value >= 60) return "Credible";
  if (value >= 40) return "Plausible";
  if (value >= 20) return "Thin";
  return "Fringe";
}

/**
 * PlausibilityMeter — REDTHREAD's own 0–100 rating for a case file. Accessible
 * (`role="meter"`); the red fill is decorative.
 */
export function PlausibilityMeter({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const tier = plausibilityTier(value);
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
        <span className="text-muted-foreground">plausibility</span>
        <span className="text-redthread">
          {value}/100 · {tier}
        </span>
      </div>
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-label={`Plausibility ${value} of 100 — ${tier}`}
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          aria-hidden="true"
          className="h-full rounded-full bg-gradient-to-r from-redthread/60 to-redthread"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
