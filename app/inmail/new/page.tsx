import type { Metadata } from "next";
import { getCurrentProfile } from "@/lib/data/profiles";
import { ComposeForm } from "@/components/inmail/compose-form";
import { PaperPanel } from "@/components/redthread/paper-panel";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = { title: "New InMail" };

export default async function NewInmailPage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string }>;
}) {
  const me = await getCurrentProfile();
  const { to } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-12">
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
        Sealed Transmission
      </p>
      <h1 className="mb-6 font-typewriter text-3xl uppercase text-foreground">
        New Drop
      </h1>

      {me ? (
        <ComposeForm defaultTo={to ?? ""} />
      ) : (
        <PaperPanel pinned>
          <p className="font-mono text-xs text-paper-foreground/85">
            Initiate to open a private channel.
          </p>
          <ButtonLink
            href="/initiation"
            className="mt-3 font-mono uppercase tracking-wider"
          >
            Begin initiation
          </ButtonLink>
        </PaperPanel>
      )}
    </div>
  );
}
