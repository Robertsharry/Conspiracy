import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Avatar — an operative's picture (image or small gif), or initials fallback.
 * `unoptimized` keeps animated gifs animating and serves the storage URL as-is.
 */
export function Avatar({
  url,
  name,
  size = 64,
  className,
}: {
  url?: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  if (url) {
    return (
      <Image
        src={url}
        alt={`${name} avatar`}
        width={size}
        height={size}
        unoptimized
        className={cn(
          "shrink-0 rounded-full border border-border object-cover",
          className,
        )}
        style={{ width: size, height: size }}
      />
    );
  }

  const initials =
    name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "??";
  return (
    <div
      aria-label={`${name} avatar`}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-border bg-card font-typewriter text-foreground",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {initials}
    </div>
  );
}
