"use client";

import { useState, useTransition } from "react";
import { castVote, type MyVote } from "@/lib/actions/vote-actions";
import { cn } from "@/lib/utils";

/**
 * CorroborateBar — Corroborate (▲) / Discredit (▼) with an optimistic score.
 * Clicking your current vote toggles it off. The DB trigger is the source of
 * truth; this just reflects it instantly.
 */
export function CorroborateBar({
  targetType,
  targetId,
  initialScore,
  initialVote = null,
  className,
}: {
  targetType: "node" | "edge" | "post";
  targetId: string;
  initialScore: number;
  initialVote?: MyVote;
  className?: string;
}) {
  const [score, setScore] = useState(initialScore);
  const [myVote, setMyVote] = useState<MyVote>(initialVote);
  const [pending, startTransition] = useTransition();

  function effect(v: "corroborate" | "discredit") {
    return v === "corroborate" ? 1 : -1;
  }

  function vote(value: "corroborate" | "discredit") {
    const prevVote = myVote;
    const prevScore = score;

    let delta = 0;
    if (myVote === value) {
      delta = -effect(value);
      setMyVote(null);
    } else {
      if (myVote) delta -= effect(myVote);
      delta += effect(value);
      setMyVote(value);
    }
    setScore((s) => s + delta);

    startTransition(async () => {
      const res = await castVote({ targetType, targetId, value });
      if ("error" in res) {
        setMyVote(prevVote);
        setScore(prevScore);
      } else {
        setMyVote(res.myVote);
      }
    });
  }

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <button
        type="button"
        onClick={() => vote("corroborate")}
        disabled={pending}
        aria-pressed={myVote === "corroborate"}
        aria-label="Corroborate"
        className={cn(
          "rounded-sm px-1 font-mono text-sm leading-none transition-colors hover:text-redthread disabled:opacity-50",
          myVote === "corroborate" ? "text-redthread" : "text-muted-foreground",
        )}
      >
        ▲
      </button>
      <span className="min-w-[2ch] text-center font-mono text-xs tabular-nums text-foreground">
        {score}
      </span>
      <button
        type="button"
        onClick={() => vote("discredit")}
        disabled={pending}
        aria-pressed={myVote === "discredit"}
        aria-label="Discredit"
        className={cn(
          "rounded-sm px-1 font-mono text-sm leading-none transition-colors hover:text-ochre disabled:opacity-50",
          myVote === "discredit" ? "text-ochre" : "text-muted-foreground",
        )}
      >
        ▼
      </button>
    </div>
  );
}
