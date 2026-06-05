import Link from "next/link";
import { Search, Bell } from "lucide-react";
import { AuthStatus } from "@/components/nav/auth-status";
import { getCurrentProfile } from "@/lib/data/profiles";
import { getUnreadCount } from "@/lib/data/notifications";

const NAV = [
  { href: "/", label: "Dispatches" },
  { href: "/boards", label: "Case Files" },
  { href: "/wire", label: "The Wire" },
  { href: "/inmail", label: "InMail" },
  { href: "/donate", label: "Fund" },
];

/**
 * SiteHeader — sticky top chrome: the REDTHREAD wordmark, primary nav, and the
 * call to "Initiate". A taut red thread-rule underlines the whole bar.
 */
export async function SiteHeader() {
  const me = await getCurrentProfile();
  const unread = me ? await getUnreadCount() : 0;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-typewriter text-xl font-bold uppercase tracking-[0.12em]">
            <span className="text-redthread">Red</span>thread
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-widest text-muted-foreground sm:inline">
            clearance: public
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-sm px-3 py-1.5 font-mono text-xs uppercase tracking-wide text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/search"
            aria-label="Search the archive"
            className="rounded-sm p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Search className="size-4" />
          </Link>
          {me && (
            <Link
              href="/pings"
              aria-label={
                unread > 0 ? `Intercepts (${unread} unread)` : "Intercepts"
              }
              className="relative rounded-sm p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Bell className="size-4" />
              {unread > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-redthread px-1 font-mono text-[9px] font-bold leading-none text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
          )}
          <AuthStatus />
        </nav>
      </div>
      <div className="thread-rule" />
    </header>
  );
}
