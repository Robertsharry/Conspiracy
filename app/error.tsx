"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";

/**
 * Themed runtime error boundary — "the signal dropped." Logs the error and
 * offers a retry (`reset`) plus an escape hatch back to Dispatches.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-28 text-center">
      <h1 className="font-typewriter text-5xl uppercase text-redthread sm:text-6xl">
        Signal Lost
      </h1>
      <p className="mt-4 max-w-sm font-mono text-sm leading-relaxed text-muted-foreground">
        Something went dark on our end. Could be a glitch. Could be interference.
        Try the connection again.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">
          trace {error.digest}
        </p>
      )}
      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className={cn(buttonVariants(), "font-mono uppercase tracking-wider")}
        >
          Re-establish connection
        </button>
        <ButtonLink
          href="/"
          variant="outline"
          className="font-mono uppercase tracking-wider"
        >
          Dispatches
        </ButtonLink>
      </div>
    </div>
  );
}
