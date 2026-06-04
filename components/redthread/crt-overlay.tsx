/**
 * CRTOverlay — fixed, non-interactive scanline + vignette + flicker layer.
 *
 * Mounted once in the root layout to give every page the dim "old monitor in a
 * situation room" atmosphere. Pure CSS (see `.crt-overlay` in globals.css); the
 * flicker animation is automatically disabled under `prefers-reduced-motion`.
 */
export function CRTOverlay() {
  return <div className="crt-overlay" aria-hidden="true" />;
}
