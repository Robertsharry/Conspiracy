import { cn } from "@/lib/utils";

export type StampVariant =
  | "top-secret"
  | "classified"
  | "confidential"
  | "declassified"
  | "cold-case"
  | "eyes-only";

/** Each variant carries its ink color (red for danger, green for cleared, etc.) and default label. */
const VARIANT_STYLES: Record<StampVariant, { color: string; label: string }> = {
  "top-secret": { color: "text-stamp border-stamp", label: "TOP SECRET" },
  classified: { color: "text-stamp border-stamp", label: "CLASSIFIED" },
  confidential: { color: "text-stamp border-stamp", label: "CONFIDENTIAL" },
  declassified: {
    color: "text-[oklch(0.55_0.13_150)] border-[oklch(0.55_0.13_150)]",
    label: "DECLASSIFIED",
  },
  "cold-case": {
    color: "text-[oklch(0.62_0.04_240)] border-[oklch(0.62_0.04_240)]",
    label: "COLD CASE",
  },
  "eyes-only": { color: "text-ochre border-ochre", label: "EYES ONLY" },
};

/**
 * TopSecretStamp — a rotated, embossed rubber-stamp mark.
 *
 * Decoration only — it is exposed to assistive tech via an accessible label so
 * the meaning ("TOP SECRET") is never lost, but it never replaces a real control.
 *
 * @param variant Visual+semantic preset (color + default label).
 * @param label   Override the displayed text (e.g. a board's case status).
 * @param rotate  Tilt in degrees; small random angles read as hand-stamped.
 */
export function TopSecretStamp({
  variant = "top-secret",
  label,
  rotate = -8,
  className,
}: {
  variant?: StampVariant;
  label?: string;
  rotate?: number;
  className?: string;
}) {
  const v = VARIANT_STYLES[variant];
  const text = label ?? v.label;
  return (
    <span
      role="img"
      aria-label={`${text} stamp`}
      style={{ transform: `rotate(${rotate}deg)` }}
      className={cn(
        "stamp-emboss pointer-events-none inline-block select-none rounded-[3px] border-[3px] px-3 py-1",
        "font-typewriter text-lg font-bold uppercase tracking-[0.18em] opacity-80",
        v.color,
        className,
      )}
    >
      {text}
    </span>
  );
}
