import { cn } from "@/lib/utils";

/**
 * PaperPanel — an aged-manila surface that content sits on.
 *
 * The workhorse of the case-file aesthetic: textured paper, sepia ink text, a
 * drop shadow that lifts it off the dark board, and an optional push-pin.
 *
 * @param tilt   Rotation in degrees for a hand-pinned, slightly-askew look.
 * @param pinned Render a push-pin at the top-center.
 */
export function PaperPanel({
  children,
  className,
  tilt = 0,
  pinned = false,
  style,
  ...props
}: React.ComponentProps<"div"> & { tilt?: number; pinned?: boolean }) {
  return (
    <div
      style={{ transform: tilt ? `rotate(${tilt}deg)` : undefined, ...style }}
      className={cn(
        "paper-texture relative rounded-[2px] p-6 text-paper-foreground",
        "shadow-[0_12px_30px_-10px_oklch(0_0_0_/_0.7)] ring-1 ring-black/25",
        className,
      )}
      {...props}
    >
      {pinned && (
        <span
          aria-hidden="true"
          className="absolute -top-2.5 left-1/2 size-3.5 -translate-x-1/2 rounded-full bg-pin shadow-[0_3px_4px_oklch(0_0_0_/_0.55)] ring-2 ring-black/25"
        />
      )}
      {children}
    </div>
  );
}
