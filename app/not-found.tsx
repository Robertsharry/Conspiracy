import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button-link";
import { TopSecretStamp } from "@/components/redthread/top-secret-stamp";

export const metadata: Metadata = { title: "File not found" };

/** Themed 404 — the record was never here, or it was expunged. */
export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-28 text-center">
      <TopSecretStamp
        variant="classified"
        label="EXPUNGED"
        rotate={-7}
        className="text-base"
      />
      <h1 className="mt-8 font-typewriter text-6xl uppercase text-foreground">
        404
      </h1>
      <p className="mt-3 font-mono text-sm uppercase tracking-[0.3em] text-redthread">
        File not found
      </p>
      <p className="mt-4 max-w-sm font-mono text-sm leading-relaxed text-muted-foreground">
        This record does not exist — or it has been pulled from the archive. Some
        files, they say, were never meant to be found.
      </p>
      <ButtonLink href="/" className="mt-8 font-mono uppercase tracking-wider">
        Back to Dispatches
      </ButtonLink>
    </div>
  );
}
