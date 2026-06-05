"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PIN_TYPES = ["theory", "person", "event", "document", "location", "claim"];

/**
 * BoardToolbar — floating add-pin control on the canvas. Pick a type, name the
 * pin, drop it on the board. (Drawing string is done by dragging between pins.)
 */
export function BoardToolbar({
  onAddPin,
}: {
  onAddPin: (type: string, title: string) => void;
}) {
  const [type, setType] = useState("claim");
  const [title, setTitle] = useState("");

  function submit() {
    const t = title.trim();
    if (!t) return;
    onAddPin(type, t);
    setTitle("");
  }

  return (
    <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-sm border border-border bg-card/90 p-2 shadow-lg backdrop-blur">
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        aria-label="Pin type"
        className="rounded-sm border border-border bg-background px-2 py-1 font-mono text-xs uppercase tracking-wide text-foreground outline-none focus-visible:ring-1 focus-visible:ring-redthread"
      >
        {PIN_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        placeholder="pin label…"
        className="h-8 w-44 font-mono text-xs"
      />
      <Button
        size="sm"
        onClick={submit}
        disabled={!title.trim()}
        className="font-mono text-xs uppercase tracking-wider"
      >
        Add pin
      </Button>
    </div>
  );
}
