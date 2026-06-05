"use client";

import { useState } from "react";
import { fileReport } from "@/lib/actions/report-actions";
import { cn } from "@/lib/utils";

const REASONS = [
  "Doxxing / real-person harassment",
  "Hate / incitement to violence",
  "Spam / scam / malware",
  "Off-topic",
  "Other",
];

/**
 * FlagButton — file a moderation report against any target. Self-contained: a
 * small "⚑ flag" toggle that opens an inline reason picker. See "The Protocols".
 */
export function FlagButton({
  targetType,
  targetId,
  className,
}: {
  targetType: "board" | "node" | "edge" | "post";
  targetId: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit() {
    setState("sending");
    const res = await fileReport({ targetType, targetId, reason });
    if ("error" in res) setState("error");
    else {
      setState("done");
      setOpen(false);
    }
  }

  if (state === "done") {
    return (
      <span
        className={cn(
          "font-mono text-[10px] uppercase tracking-widest text-muted-foreground",
          className,
        )}
      >
        flagged for review ✓
      </span>
    );
  }

  return (
    <span className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title="Flag for review"
        className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-redthread"
      >
        ⚑ flag
      </button>
      {open && (
        <span className="absolute right-0 z-30 mt-1 flex w-52 flex-col gap-2 rounded-sm border border-border bg-card p-2 shadow-lg">
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            aria-label="Reason"
            className="rounded-sm border border-border bg-background px-2 py-1 font-mono text-[11px] text-foreground outline-none focus-visible:ring-1 focus-visible:ring-redthread"
          >
            {REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={submit}
            disabled={state === "sending"}
            className="rounded-sm bg-primary px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/80 disabled:opacity-50"
          >
            {state === "sending" ? "Filing…" : "File report"}
          </button>
          {state === "error" && (
            <span className="font-mono text-[10px] text-destructive">
              Could not file — initiate first?
            </span>
          )}
        </span>
      )}
    </span>
  );
}
