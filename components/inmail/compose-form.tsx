"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendInmail } from "@/lib/actions/message-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const labelCls = "mb-1 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground";

/**
 * ComposeForm — start (or address) an InMail. If `defaultTo` is set the
 * recipient is locked (e.g. arriving from a dossier). On success, routes to the
 * conversation.
 */
export function ComposeForm({ defaultTo = "" }: { defaultTo?: string }) {
  const router = useRouter();
  const [to, setTo] = useState(defaultTo);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!to.trim() || !body.trim()) return;
    setSending(true);
    setError("");
    const res = await sendInmail({
      toShadowName: to.trim(),
      subject: subject.trim() || undefined,
      body: body.trim(),
    });
    setSending(false);
    if ("id" in res) {
      router.push(`/inmail/${encodeURIComponent(res.to)}`);
    } else {
      setError(res.error);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="to" className={labelCls}>
          To (shadow name)
        </label>
        <Input
          id="to"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          readOnly={Boolean(defaultTo)}
          required
          placeholder="the_archivist"
          autoComplete="off"
          className="font-mono text-sm"
        />
      </div>
      <div>
        <label htmlFor="subject" className={labelCls}>
          Subject (optional)
        </label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="re: the thing we don't name"
          className="font-mono text-sm"
        />
      </div>
      <div>
        <label htmlFor="body" className={labelCls}>
          Transmission
        </label>
        <Textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          required
          placeholder="Speak plainly. This is just between us."
          className="font-mono text-sm"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={sending || !to.trim() || !body.trim()}
          className="font-mono uppercase tracking-wider"
        >
          {sending ? "Dropping…" : "Send the drop"}
        </Button>
        {error && (
          <span className="font-mono text-xs text-destructive" role="alert">
            {error}
          </span>
        )}
      </div>
    </form>
  );
}
