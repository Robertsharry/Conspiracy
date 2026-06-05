import { tierInfo } from "@/lib/supporters";
import { cn } from "@/lib/utils";

/**
 * BenefactorMark — a small status chip for a supporter tier. Renders nothing for
 * non-supporters. Color is the tier's; the ◆ is the mark.
 */
export function BenefactorMark({
  tier,
  className,
}: {
  tier: string | null | undefined;
  className?: string;
}) {
  const info = tierInfo(tier);
  if (!info) return null;
  return (
    <span
      title={`Benefactor — ${info.label}`}
      style={{ borderColor: info.color, color: info.color }}
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest",
        className,
      )}
    >
      ◆ {info.label}
    </span>
  );
}
