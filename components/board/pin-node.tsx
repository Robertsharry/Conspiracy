"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";

export type PinNodeData = {
  type: string;
  title: string;
  body?: string | null;
};

/** Accent color per pin type (the small type label). */
const TYPE_ACCENT: Record<string, string> = {
  theory: "text-redthread",
  person: "text-ochre",
  event: "text-[oklch(0.62_0.04_240)]",
  document: "text-ink-faded",
  location: "text-[oklch(0.6_0.1_150)]",
  media: "text-[oklch(0.6_0.12_300)]",
  claim: "text-ink-faded",
  signal: "text-redthread",
};

/**
 * PinNode — a piece of evidence on the corkboard, rendered as a manila card.
 * Top/bottom handles let operatives drag the red string between pins.
 */
export function PinNode({ data, selected }: NodeProps) {
  const d = data as PinNodeData;
  const accent = TYPE_ACCENT[d.type] ?? TYPE_ACCENT.claim;
  return (
    <div
      className={cn(
        "paper-texture w-56 rounded-[2px] p-3 text-paper-foreground shadow-[0_8px_20px_-8px_oklch(0_0_0_/_0.7)] ring-1 ring-black/25",
        selected && "ring-2 ring-redthread",
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!size-2 !border-0 !bg-redthread"
      />
      <div className={cn("font-mono text-[9px] uppercase tracking-widest", accent)}>
        {d.type}
      </div>
      <div className="mt-1 font-typewriter text-sm leading-tight text-ink">
        {d.title}
      </div>
      {d.body && (
        <p className="mt-1 line-clamp-3 font-mono text-[10px] leading-snug text-paper-foreground/80">
          {d.body}
        </p>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!size-2 !border-0 !bg-redthread"
      />
    </div>
  );
}
