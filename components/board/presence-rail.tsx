"use client";

import { Avatar } from "@/components/redthread/avatar";

export interface Watcher {
  id: string;
  name: string;
  avatarUrl: string | null;
  color: string;
}

/**
 * PresenceRail — the operatives currently watching this case file, shown as a
 * cluster of color-ringed avatars. "They are watching" — literally.
 */
export function PresenceRail({ watchers }: { watchers: Watcher[] }) {
  if (watchers.length === 0) return null;
  return (
    <div className="absolute right-3 top-3 z-10 flex items-center gap-2 rounded-full border border-border bg-card/90 px-2.5 py-1 backdrop-blur">
      <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        {watchers.length} watching
      </span>
      <div className="flex -space-x-1.5">
        {watchers.slice(0, 6).map((w) => (
          <span
            key={w.id}
            title={w.name}
            className="inline-flex rounded-full border-2"
            style={{ borderColor: w.color }}
          >
            <Avatar url={w.avatarUrl} name={w.name} size={20} className="!border-0" />
          </span>
        ))}
        {watchers.length > 6 && (
          <span className="ml-1 font-mono text-[9px] text-muted-foreground">
            +{watchers.length - 6}
          </span>
        )}
      </div>
    </div>
  );
}
