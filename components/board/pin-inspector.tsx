"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CorroborateBar } from "@/components/redthread/corroborate-bar";
import { createPost } from "@/lib/actions/post-actions";
import type { MyVote } from "@/lib/actions/vote-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { PinNodeData } from "./pin-node";

export type SelectedPin = { id: string; data: PinNodeData };

interface NoteRow {
  id: string;
  body: string;
  created_at: string;
  author_name: string | null;
}

/** A node id that exists in the DB (not an optimistic temp id). */
const isPersisted = (id: string) => !id.startsWith("tmp-");

/** PostgREST may surface an embedded author as an object or a 1-element array. */
function shadowNameOf(author: unknown): string | null {
  if (!author) return null;
  const a = Array.isArray(author) ? author[0] : author;
  return (a as { shadow_name?: string } | undefined)?.shadow_name ?? null;
}

/**
 * PinInspector — slide-in panel for the selected pin: full detail, the
 * Corroborate/Discredit bar, and its node-level case-notes. Reads via the
 * browser client (RLS-scoped); writes via server actions.
 */
export function PinInspector({
  boardId,
  pin,
  canEdit,
  onClose,
}: {
  boardId: string;
  pin: SelectedPin;
  canEdit: boolean;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [myVote, setMyVote] = useState<MyVote>(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!isPersisted(pin.id)) {
      setNotes([]);
      setMyVote(null);
      setLoading(false);
      return;
    }
    let active = true;
    const supabase = createClient();
    setLoading(true);
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const [postsRes, voteRes] = await Promise.all([
        supabase
          .from("posts")
          .select("id, body, created_at, author:profiles(shadow_name)")
          .eq("node_id", pin.id)
          .is("deleted_at", null)
          .order("created_at", { ascending: true }),
        user
          ? supabase
              .from("votes")
              .select("value")
              .eq("voter_id", user.id)
              .eq("target_type", "node")
              .eq("target_id", pin.id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      if (!active) return;
      const rows = (postsRes.data ?? []) as unknown as Array<{
        id: string;
        body: string;
        created_at: string;
        author: unknown;
      }>;
      setNotes(
        rows.map((p) => ({
          id: p.id,
          body: p.body,
          created_at: p.created_at,
          author_name: shadowNameOf(p.author),
        })),
      );
      const v = (voteRes as { data: { value: string } | null }).data;
      setMyVote((v?.value as MyVote) ?? null);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [pin.id]);

  async function submitNote() {
    const body = draft.trim();
    if (!body || !isPersisted(pin.id)) return;
    setPosting(true);
    const res = await createPost({ boardId, nodeId: pin.id, body });
    setPosting(false);
    if ("id" in res) {
      setNotes((n) => [
        ...n,
        { id: res.id, body, created_at: new Date().toISOString(), author_name: "you" },
      ]);
      setDraft("");
    }
  }

  return (
    <aside className="absolute right-0 top-0 z-20 flex h-full w-80 max-w-[85%] flex-col border-l border-border bg-card/95 backdrop-blur">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-redthread">
          {pin.data.type}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close inspector"
          className="font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <h3 className="font-typewriter text-lg leading-tight text-foreground">
          {pin.data.title}
        </h3>
        {pin.data.body && (
          <p className="mt-2 whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted-foreground">
            {pin.data.body}
          </p>
        )}
        {pin.data.sourceUrl && (
          <a
            href={pin.data.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block break-all font-mono text-[11px] text-redthread underline"
          >
            source ↗
          </a>
        )}

        <div className="mt-3">
          {isPersisted(pin.id) ? (
            <CorroborateBar
              targetType="node"
              targetId={pin.id}
              initialScore={pin.data.score ?? 0}
              initialVote={myVote}
            />
          ) : (
            <span className="font-mono text-[10px] text-muted-foreground">saving…</span>
          )}
        </div>

        <div className="thread-rule my-4 h-px" />
        <h4 className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Case notes
        </h4>
        {loading ? (
          <p className="font-mono text-xs text-muted-foreground">decrypting…</p>
        ) : notes.length ? (
          <ul className="space-y-3">
            {notes.map((n) => (
              <li key={n.id} className="rounded-sm border border-border bg-background/50 p-2">
                <div className="mb-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  {n.author_name ?? "redacted"}
                </div>
                <p className="whitespace-pre-wrap font-mono text-xs text-foreground">
                  {n.body}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-mono text-xs text-muted-foreground">
            No notes on this pin yet.
          </p>
        )}
      </div>

      {canEdit && isPersisted(pin.id) && (
        <div className="border-t border-border p-3">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            placeholder="Add a case-note…"
            className="font-mono text-xs"
          />
          <Button
            size="sm"
            onClick={submitNote}
            disabled={posting || !draft.trim()}
            className="mt-2 w-full font-mono text-xs uppercase tracking-wider"
          >
            {posting ? "Filing…" : "File note"}
          </Button>
        </div>
      )}
    </aside>
  );
}
