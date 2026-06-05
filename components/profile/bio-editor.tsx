"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateBio } from "@/lib/actions/profile-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/**
 * BioEditor — lets an operative write their own "field notes" (profile bio),
 * shown only on their own dossier.
 */
export function BioEditor({ initial }: { initial: string | null }) {
  const router = useRouter();
  const [bio, setBio] = useState(initial ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    setSaved(false);
    const res = await updateBio(bio);
    setSaving(false);
    if ("error" in res) {
      setError(res.error);
    } else {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={bio}
        onChange={(e) => {
          setBio(e.target.value);
          setSaved(false);
        }}
        rows={4}
        placeholder="What do you know? Keep it on the record…"
        className="border-ink/30 bg-paper-aged/40 font-mono text-xs text-ink placeholder:text-ink-faded/60"
      />
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          onClick={save}
          disabled={saving}
          className="font-mono text-xs uppercase tracking-wider"
        >
          {saving ? "Filing…" : "Save field notes"}
        </Button>
        {saved && (
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faded">
            on the record
          </span>
        )}
        {error && (
          <span className="font-mono text-[10px] text-destructive" role="alert">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
