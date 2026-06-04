"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * RedactedText — text hidden behind a black bar that the reader can lift.
 *
 * Accessibility is deliberate: the real text is always in the DOM, the control
 * is keyboard-operable (Enter/Space), and while hidden it announces itself as
 * "Redacted: <text>" so the wink never costs a screen-reader user the content.
 *
 * @param defaultRevealed Start in the revealed state (e.g. on hover-only pages).
 */
export function RedactedText({
  children,
  className,
  defaultRevealed = false,
}: {
  children: string;
  className?: string;
  defaultRevealed?: boolean;
}) {
  const [revealed, setRevealed] = useState(defaultRevealed);
  const toggle = () => setRevealed((v) => !v);

  return (
    <span
      role="button"
      tabIndex={0}
      aria-pressed={revealed}
      aria-label={revealed ? undefined : `Redacted: ${children}`}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      }}
      data-revealed={revealed}
      className={cn(
        "cursor-pointer rounded-[2px] px-1 outline-none transition-colors duration-200",
        "focus-visible:ring-2 focus-visible:ring-redthread",
        revealed
          ? "bg-ink/10 text-inherit"
          : "select-none bg-ink text-transparent hover:bg-ink/85",
        className,
      )}
    >
      {children}
    </span>
  );
}
