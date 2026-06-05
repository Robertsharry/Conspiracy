"use client";

import { useActionState } from "react";
import { createBoard } from "@/lib/actions/board-actions";
import type { ActionState } from "@/lib/actions/profile-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const CATEGORIES = [
  "conspiracy",
  "disappearance",
  "event",
  "phenomenon",
  "coverup",
  "person",
  "other",
];

const initial: ActionState = {};
const labelCls =
  "mb-1 block font-mono text-[10px] uppercase tracking-widest text-ink-faded";
const fieldCls =
  "border-ink/30 bg-paper-aged/40 font-mono text-ink placeholder:text-ink-faded/60";

export function NewBoardForm() {
  const [state, action, pending] = useActionState(createBoard, initial);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="title" className={labelCls}>
          Case title
        </label>
        <Input
          id="title"
          name="title"
          required
          placeholder="The ____ Files"
          className={fieldCls}
        />
      </div>

      <div>
        <label htmlFor="category" className={labelCls}>
          Category
        </label>
        <select
          id="category"
          name="category"
          defaultValue="conspiracy"
          className="w-full rounded-sm border border-ink/30 bg-paper-aged/40 px-2 py-2 font-mono text-sm uppercase tracking-wide text-ink outline-none focus-visible:ring-1 focus-visible:ring-redthread"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="summary" className={labelCls}>
          Dossier blurb
        </label>
        <Textarea
          id="summary"
          name="summary"
          rows={3}
          placeholder="What's the case? Keep it tight."
          className={fieldCls}
        />
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="w-full font-mono uppercase tracking-wider"
      >
        {pending ? "Opening the file…" : "Open case file"}
      </Button>

      {state?.error && (
        <p className="font-mono text-xs text-destructive" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
