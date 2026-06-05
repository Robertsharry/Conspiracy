"use client";

import { useActionState } from "react";
import { claimShadowName, type ActionState } from "@/lib/actions/profile-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initial: ActionState = {};

/**
 * Step two of initiation: claim a shadow name. On success the action redirects
 * to the new dossier, so we only render the error path here.
 */
export function ClaimShadowNameForm() {
  const [state, action, pending] = useActionState(claimShadowName, initial);

  return (
    <form action={action} className="space-y-3">
      <label
        htmlFor="shadow_name"
        className="block font-mono text-[10px] uppercase tracking-widest text-ink-faded"
      >
        Your shadow name
      </label>
      <Input
        id="shadow_name"
        name="shadow_name"
        required
        autoComplete="off"
        autoFocus
        placeholder="the_archivist"
        className="border-ink/30 bg-paper-aged/40 font-mono text-ink placeholder:text-ink-faded/60"
      />
      <p className="font-mono text-[10px] text-ink-faded">
        3–24 characters. Letters, numbers, dots, dashes, underscores. Choose
        wisely — it&apos;s how the others will know you.
      </p>
      <Button
        type="submit"
        disabled={pending}
        className="w-full font-mono uppercase tracking-wider"
      >
        {pending ? "Sealing the record…" : "Claim this name"}
      </Button>
      {state?.error && (
        <p className="font-mono text-xs text-destructive" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
