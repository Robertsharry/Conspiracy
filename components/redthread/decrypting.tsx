import { cn } from "@/lib/utils";

/**
 * Decrypting — the house loading state. A typewriter "DECRYPTING…" with a
 * blinking caret and scanning skeleton bars. Used by route `loading.tsx` files
 * so every navigation reads like cracking open a file. Honors reduced-motion
 * (the global rule zeroes the pulse).
 */
export function Decrypting({
  label = "Decrypting",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-1 items-center justify-center px-4 py-24",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="w-full max-w-xs text-center">
        <p className="font-typewriter text-2xl uppercase tracking-[0.25em] text-foreground">
          {label}
          <span className="ml-1 inline-block animate-pulse text-redthread">▋</span>
        </p>
        <div className="thread-rule mx-auto mt-4 h-px w-40" />
        <div className="mx-auto mt-6 flex flex-col gap-2">
          <span className="h-2.5 w-full animate-pulse rounded-sm bg-foreground/15" />
          <span className="h-2.5 w-4/5 animate-pulse rounded-sm bg-foreground/10 [animation-delay:150ms]" />
          <span className="h-2.5 w-11/12 animate-pulse rounded-sm bg-foreground/15 [animation-delay:300ms]" />
        </div>
        <p className="mt-5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          accessing the file
        </p>
        <span className="sr-only">Loading…</span>
      </div>
    </div>
  );
}
