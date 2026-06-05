import { cn } from "@/lib/utils";

/**
 * InlineLoading — a small spinner + label for item/action loads (inspector
 * fetches, in-place lists, etc.). Themed red spinner; honors reduced-motion via
 * the global rule.
 */
export function InlineLoading({
  label = "Decrypting…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-xs text-muted-foreground",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span
        aria-hidden="true"
        className="inline-block size-3.5 animate-spin rounded-full border-2 border-redthread border-t-transparent"
      />
      {label}
    </span>
  );
}
