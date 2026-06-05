import type { Metadata } from "next";
import { getCurrentProfile } from "@/lib/data/profiles";
import { NewBoardForm } from "@/components/board/new-board-form";
import { PaperPanel } from "@/components/redthread/paper-panel";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = { title: "Open a Case File" };

export default async function NewBoardPage() {
  const me = await getCurrentProfile();

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <PaperPanel pinned className="w-full max-w-lg">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-faded">
          New Dossier
        </p>
        <h1 className="mb-5 font-typewriter text-3xl uppercase text-ink">
          Open a Case File
        </h1>

        {me ? (
          <NewBoardForm />
        ) : (
          <div className="space-y-3">
            <p className="font-mono text-xs leading-relaxed text-paper-foreground/85">
              You must be initiated to open a case file.
            </p>
            <ButtonLink
              href="/initiation"
              className="font-mono uppercase tracking-wider"
            >
              Begin initiation
            </ButtonLink>
          </div>
        )}
      </PaperPanel>
    </div>
  );
}
