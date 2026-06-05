import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/data/profiles";
import { listNotifications } from "@/lib/data/notifications";
import { markAllIntercepts } from "@/lib/actions/notification-actions";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Intercepts" };

const VERB: Record<string, string> = {
  mention: "tagged you",
  reply: "replied to your note",
  inmail: "sent you InMail",
};

export default async function PingsPage() {
  const me = await getCurrentProfile();
  if (!me) redirect("/initiation");

  const items = await listNotifications();
  const unread = items.filter((i) => !i.read_at).length;

  async function clearIntercepts() {
    "use server";
    await markAllIntercepts();
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Surveillance
          </p>
          <h1 className="font-typewriter text-4xl uppercase text-foreground sm:text-5xl">
            Intercepts
          </h1>
        </div>
        {unread > 0 && (
          <form action={clearIntercepts}>
            <button
              type="submit"
              className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
            >
              mark all read
            </button>
          </form>
        )}
      </div>
      <p className="mt-2 font-mono text-sm text-muted-foreground">
        Chatter where your name came up — mentions and replies.
      </p>

      <div className="thread-rule my-6 h-px" />

      {items.length === 0 ? (
        <p className="font-mono text-sm text-muted-foreground">
          No intercepts. Either nobody is talking about you… or they have learned
          not to.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li key={n.id}>
              <Link
                href={n.link}
                className={cn(
                  "block rounded-sm border p-3 transition-colors",
                  n.read_at
                    ? "border-border bg-card/40 hover:bg-card"
                    : "border-redthread/40 bg-redthread/[0.06] hover:bg-redthread/10",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-redthread">
                    {n.actor_name ?? "someone"} {VERB[n.kind] ?? "pinged you"}
                  </span>
                  {!n.read_at && (
                    <span className="size-1.5 shrink-0 rounded-full bg-redthread" />
                  )}
                </div>
                {n.body && (
                  <p className="mt-1 line-clamp-2 font-mono text-xs text-muted-foreground">
                    {n.body}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
