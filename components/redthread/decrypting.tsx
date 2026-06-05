import { cn } from "@/lib/utils";

/**
 * Decrypting — the house full-screen loading state. Big typewriter "DECRYPTING…"
 * with a blinking caret, scanning skeleton bars, and a red scan line sweeping
 * over them. Used by route `loading.tsx` files so every navigation is
 * unmistakably loading. Honors reduced-motion.
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
      className={cn("flex flex-1 items-center justify-center px-4 py-20", className)}
      role="status"
      aria-live="polite"
    >
      <div className="w-full max-w-sm text-center">
        <p className="font-typewriter text-3xl uppercase tracking-[0.25em] text-foreground sm:text-4xl">
          {label}
          <span className="ml-1 inline-block animate-pulse text-redthread">▋</span>
        </p>
        <div className="thread-rule mx-auto mt-5 h-px w-48" />

        {/* scanning bars with a sweeping red line */}
        <div className="relative mx-auto mt-8 flex w-64 flex-col gap-2 overflow-hidden py-1">
          <span className="h-3 w-full animate-pulse rounded-sm bg-foreground/15" />
          <span className="h-3 w-4/5 animate-pulse rounded-sm bg-foreground/10 [animation-delay:150ms]" />
          <span className="h-3 w-11/12 animate-pulse rounded-sm bg-foreground/15 [animation-delay:300ms]" />
          <span className="h-3 w-2/3 animate-pulse rounded-sm bg-foreground/10 [animation-delay:450ms]" />
          <span
            aria-hidden="true"
            className="decrypt-scan absolute left-0 h-px w-full bg-redthread shadow-[0_0_10px_2px_oklch(0.53_0.21_25_/_0.6)]"
          />
        </div>

        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          accessing the file
        </p>
        <span className="sr-only">Loading…</span>
      </div>
    </div>
  );
}
