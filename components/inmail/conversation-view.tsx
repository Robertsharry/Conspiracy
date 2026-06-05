"use client";

import { useEffect, useState } from "react";
import { sendInmail, markInmailRead } from "@/lib/actions/message-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { InmailMessage } from "@/lib/data/messages";
import { cn } from "@/lib/utils";

/**
 * ConversationView — the discreet 1:1 thread. Marks incoming as read on open,
 * renders messages email-style (yours right, theirs left), and replies inline
 * (optimistic).
 */
export function ConversationView({
  other,
  initialMessages,
}: {
  other: string;
  initialMessages: InmailMessage[];
}) {
  const [messages, setMessages] = useState<InmailMessage[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    void markInmailRead(other);
  }, [other]);

  async function send() {
    const trimmed = body.trim();
    if (!trimmed) return;
    setSending(true);
    const res = await sendInmail({ toShadowName: other, body: trimmed });
    setSending(false);
    if ("id" in res) {
      setMessages((m) => [
        ...m,
        {
          id: res.id,
          body: trimmed,
          subject: null,
          created_at: new Date().toISOString(),
          mine: true,
        },
      ]);
      setBody("");
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {messages.length === 0 && (
          <p className="font-mono text-xs text-muted-foreground">
            No transmissions yet. Open the channel.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn("flex", m.mine ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-sm border px-3 py-2",
                m.mine
                  ? "border-redthread/40 bg-redthread/10"
                  : "border-border bg-card/60",
              )}
            >
              {m.subject && (
                <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {m.subject}
                </div>
              )}
              <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground">
                {m.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-3">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder={`Reply to ${other}…`}
          className="font-mono text-xs"
        />
        <Button
          size="sm"
          onClick={send}
          disabled={sending || !body.trim()}
          className="mt-2 font-mono text-xs uppercase tracking-wider"
        >
          {sending ? "Dropping…" : "Send"}
        </Button>
      </div>
    </div>
  );
}
