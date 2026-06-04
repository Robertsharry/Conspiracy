"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Typewriter — types `text` out one character at a time with a blinking caret.
 *
 * Under `prefers-reduced-motion` the full text appears immediately (no caret).
 * The complete string is exposed to assistive tech via `aria-label`, so the
 * animation is purely visual.
 *
 * @param speed      Milliseconds per character.
 * @param startDelay Delay before typing begins.
 */
export function Typewriter({
  text,
  className,
  speed = 45,
  startDelay = 200,
  caret = true,
}: {
  text: string;
  className?: string;
  speed?: number;
  startDelay?: number;
  caret?: boolean;
}) {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(text.length);
      setDone(true);
      return;
    }
    let i = 0;
    let next: ReturnType<typeof setTimeout>;
    const start = setTimeout(function tick() {
      i += 1;
      setCount(i);
      if (i < text.length) next = setTimeout(tick, speed);
      else setDone(true);
    }, startDelay);
    return () => {
      clearTimeout(start);
      clearTimeout(next);
    };
  }, [text, speed, startDelay]);

  return (
    <span className={cn(className)} aria-label={text}>
      <span aria-hidden="true">{text.slice(0, count)}</span>
      {caret && !done && (
        <span aria-hidden="true" className="ml-0.5 animate-pulse text-redthread">
          ▋
        </span>
      )}
    </span>
  );
}
