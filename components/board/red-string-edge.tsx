"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";

export type RedStringData = { label?: string | null; kind?: string };

/**
 * RedStringEdge — a connection drawn as taut red yarn, with an optional
 * relationship label floating at the midpoint.
 */
export function RedStringEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const d = data as RedStringData | undefined;
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        style={{
          stroke: "var(--redthread)",
          strokeWidth: selected ? 3 : 2,
          filter: "drop-shadow(0 1px 1px oklch(0 0 0 / 0.5))",
        }}
      />
      {d?.label ? (
        <EdgeLabelRenderer>
          <div
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
            className="pointer-events-none absolute rounded-sm border border-redthread/40 bg-background/85 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-redthread"
          >
            {d.label}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}
