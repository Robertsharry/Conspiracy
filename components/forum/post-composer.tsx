"use client";

import { useState } from "react";
import { createPost } from "@/lib/actions/post-actions";
import { Button } from "@/components/ui/button";
import { MentionTextarea } from "@/components/redthread/mention-textarea";
import type { ThreadPost } from "@/lib/data/posts";

/**
 * PostComposer — file a board-level case-note, or a reply (via `parentId`).
 * On success it hands an optimistic ThreadPost back to the thread.
 */
export function PostComposer({
  boardId,
  parentId,
  meName,
  onPosted,
  placeholder,
  compact = false,
}: {
  boardId: string;
  parentId?: string;
  meName: string | null;
  onPosted: (post: ThreadPost) => void;
  placeholder?: string;
  compact?: boolean;
}) {
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    const trimmed = body.trim();
    if (!trimmed) return;
    setPosting(true);
    setError("");
    const res = await createPost({ boardId, parentId, body: trimmed });
    setPosting(false);
    if ("id" in res) {
      onPosted({
        id: res.id,
        parent_id: parentId ?? null,
        body: trimmed,
        score: 0,
        created_at: new Date().toISOString(),
        author_name: meName ?? "you",
        my_vote: null,
      });
      setBody("");
    } else {
      setError(res.error);
    }
  }

  return (
    <div className="space-y-2">
      <MentionTextarea
        value={body}
        onChange={setBody}
        onEnter={submit}
        rows={compact ? 2 : 3}
        placeholder={placeholder ?? "File a case-note…  (@ to tag an operative)"}
        className="font-mono text-xs"
      />
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          onClick={submit}
          disabled={posting || !body.trim()}
          className="font-mono text-xs uppercase tracking-wider"
        >
          {posting ? "Filing…" : "File note"}
        </Button>
        {error && (
          <span className="font-mono text-xs text-destructive" role="alert">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
