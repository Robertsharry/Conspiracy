import Link from "next/link";
import { getCurrentProfile, isUnclaimed } from "@/lib/data/profiles";
import { ButtonLink } from "@/components/ui/button-link";
import { signOut } from "@/lib/actions/profile-actions";

/**
 * Header auth state. Shows the operative's shadow name (linking to their
 * dossier) with a quiet "exit", or an Initiate button when signed out.
 * Async Server Component — reads the session per request.
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

  // Signed in but hasn't picked a handle yet — nudge them to finish.
  const label = isUnclaimed(profile) ? "claim your name" : profile.shadow_name;

  return (
    <div className="ml-2 flex items-center gap-2">
      <Link
        href={isUnclaimed(profile) ? "/initiation" : `/dossier/${profile.shadow_name}`}
        className="max-w-[12ch] truncate font-mono text-xs uppercase tracking-wider text-foreground transition-colors hover:text-redthread"
        title={label}
      >
        {label}
      </Link>
      <form action={signOut}>
        <button
          type="submit"
          className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          title="Sign out"
        >
          exit
        </button>
      </form>
    </div>
  );
}
