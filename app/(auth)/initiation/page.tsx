import type { Metadata } from "next";
import { getCurrentProfile, isUnclaimed } from "@/lib/data/profiles";
import { InitiationEmailForm } from "@/components/auth/initiation-email-form";
import { ClaimShadowNameForm } from "@/components/auth/claim-shadow-name-form";
import { PaperPanel } from "@/components/redthread/paper-panel";
import { TopSecretStamp } from "@/components/redthread/top-secret-stamp";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = { title: "Initiation" };

export default async function InitiationPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const profile = await getCurrentProfile();

  const stage: "request" | "claim" | "done" = !profile
    ? "request"
    : isUnclaimed(profile)
      ? "claim"
      : "done";

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <PaperPanel pinned className="w-full max-w-md">
        <div className="mb-5 flex items-start justify-between gap-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faded">
              Clearance Form 0001
            </p>
            <h1 className="font-typewriter text-3xl uppercase text-ink">
              {stage === "request" && "Initiation"}
              {stage === "claim" && "Identify Yourself"}
              {stage === "done" && "Already Inside"}
            </h1>
          </div>
          <TopSecretStamp variant="confidential" rotate={7} className="text-[0.55rem]" />
        </div>

        {error === "link" && (
          <p className="mb-4 font-mono text-xs text-destructive" role="alert">
            That link was expired or already used. Request a fresh one.
          </p>
        )}

        {stage === "request" && (
          <>
            <p className="mb-5 font-mono text-xs leading-relaxed text-paper-foreground/85">
              No passwords. We don&apos;t keep what we don&apos;t need. Give a
              dead-drop address and we&apos;ll send a one-time link.
            </p>
            <InitiationEmailForm />
          </>
        )}

        {stage === "claim" && (
          <>
            <p className="mb-5 font-mono text-xs leading-relaxed text-paper-foreground/85">
              You&apos;re in. Now bury your real name. Pick the handle the others
              will know you by.
            </p>
            <ClaimShadowNameForm />
          </>
        )}

        {stage === "done" && profile && (
          <div className="space-y-4">
            <p className="font-mono text-xs leading-relaxed text-paper-foreground/85">
              You&apos;re already one of us,{" "}
              <span className="text-ink">{profile.shadow_name}</span>. The wall is
              waiting.
            </p>
            <div className="flex flex-col gap-2">
              <ButtonLink
                href={`/dossier/${profile.shadow_name}`}
                className="w-full font-mono uppercase tracking-wider"
              >
                View your dossier
              </ButtonLink>
              <ButtonLink
                href="/boards"
                variant="outline"
                className="w-full font-mono uppercase tracking-wider"
              >
                Enter the archive
              </ButtonLink>
            </div>
          </div>
        )}
      </PaperPanel>
    </div>
  );
}
