"use client";

import { useState } from "react";
import Link from "next/link";
import { CorroborateBar } from "@/components/redthread/corroborate-bar";
import { PostComposer } from "./post-composer";
import type { ThreadPost } from "@/lib/data/posts";
import { cn } from "@/lib/utils";

/** A post plus its nested replies. */
export interface ThreadNode extends ThreadPost {
  children: ThreadNode[];
}

/**
 * PostItem — one case-note with its Corroborate/Discredit bar, a reply toggle,
 * and recursively-rendered replies (indented, depth-capped for sanity).
 */
export function PostItem({
  node,
  boardId,
  canPost,
  meName,
  onReplied,
  depth,
}: {
  node: ThreadNode;
  boardId: string;
  canPost: boolean;
  meName: string | null;
  onReplied: (post: ThreadPost) => void;
  depth: number;
}) {
  const [replying, setReplying] = useState(false);

  return (
    <div className={cn(depth > 0 && "border-l border-border/60 pl-3")}>
      <div className="rounded-sm border border-border bg-card/50 p-3">
        <div className="mb-1 flex items-center justify-between gap-2">
          {node.author_name ? (
            <Link
              href={`/dossier/${node.author_name}`}
              className="font-mono text-[10px] uppercase tracking-widest text-redthread hover:underline"
            >
              {node.author_name}
            </Link>
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              redacted
            </span>
          )}
          <CorroborateBar
            targetType="post"
            targetId={node.id}
            initialScore={node.score}
            initialVote={node.my_vote}
          />
        </div>
        <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground">
          {node.body}
        </p>
        {canPost && (
          <button
            type="button"
            onClick={() => setReplying((v) => !v)}
            className="mt-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            {replying ? "cancel" : "reply"}
          </button>
        )}
        {replying && (
          <div className="mt-2">
            <PostComposer
              boardId={boardId}
              parentId={node.id}
              meName={meName}
              compact
              placeholder="Reply to this note…"
              onPosted={(p) => {
                onReplied(p);
                setReplying(false);
              }}
            />
          </div>
        )}
      </div>

      {node.children.length > 0 && (
        <div className="mt-2 space-y-2">
          {node.children.map((child) => (
            <PostItem
              key={child.id}
              node={child}
              boardId={boardId}
              canPost={canPost}
              meName={meName}
              onReplied={onReplied}
              depth={Math.min(depth + 1, 5)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
