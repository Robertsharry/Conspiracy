import Link from "next/link";
import { getCurrentProfile, isUnclaimed } from "@/lib/data/profiles";
import { Avatar } from "@/components/redthread/avatar";
import { ButtonLink } from "@/components/ui/button-link";
import { signOut } from "@/lib/actions/profile-actions";

/**
 * Header auth state. Signed in → avatar + shadow name linking to the operative's
 * dossier, with a quiet "exit". Signed out → an Initiate button. Async Server
 * Component; reads the session per request.
 */
export async function AuthStatus() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <ButtonLink
        href="/initiation"
        size="sm"
        className="ml-2 font-mono text-xs uppercase tracking-wider"
      >
        Initiate
      </ButtonLink>
    );
  }

  // Signed in but hasn't claimed a handle yet — nudge them to finish.
  if (isUnclaimed(profile)) {
    return (
      <ButtonLink
        href="/initiation"
        size="sm"
        className="ml-2 font-mono text-xs uppercase tracking-wider"
      >
        Claim your name
      </ButtonLink>
    );
  }

  return (
    <div className="ml-2 flex items-center gap-2">
      <Link
        href={`/dossier/${profile.shadow_name}`}
        title="Your dossier"
        className="flex items-center gap-2 rounded-sm px-1 py-0.5 transition-colors hover:bg-accent"
      >
        <Avatar url={profile.avatar_url} name={profile.shadow_name} size={24} />
        <span className="hidden max-w-[14ch] truncate font-mono text-xs uppercase tracking-wider text-foreground sm:inline">
          {profile.shadow_name}
        </span>
      </Link>
      <form action={signOut}>
        <button
          type="submit"
          title="Sign out"
          className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
        >
          exit
        </button>
      </form>
    </div>
  );
}
