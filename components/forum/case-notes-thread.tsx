"use client";

import { useMemo, useState } from "react";
import { PostComposer } from "./post-composer";
import { PostItem, type ThreadNode } from "./post-item";
import type { ThreadPost } from "@/lib/data/posts";

/** Assemble flat posts into reply trees, preserving time order at each level. */
function buildTree(posts: ThreadPost[]): ThreadNode[] {
  const map = new Map<string, ThreadNode>();
  posts.forEach((p) => map.set(p.id, { ...p, children: [] }));
  const roots: ThreadNode[] = [];
  for (const node of map.values()) {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

/**
 * CaseNotesThread — the per-case-file forum below the board. Holds posts in
 * client state so new notes/replies appear instantly (optimistic), then builds
 * the reply tree for display.
 */
export function CaseNotesThread({
  boardId,
  canPost,
  meName,
  initialPosts,
}: {
  boardId: string;
  canPost: boolean;
  meName: string | null;
  initialPosts: ThreadPost[];
}) {
  const [posts, setPosts] = useState<ThreadPost[]>(initialPosts);
  const addPost = (p: ThreadPost) => setPosts((prev) => [...prev, p]);
  const tree = useMemo(() => buildTree(posts), [posts]);

  return (
    <section className="mx-auto mt-12 max-w-3xl">
      <h2 className="font-typewriter text-2xl uppercase text-foreground">Case Notes</h2>
      <p className="mb-5 mt-1 font-mono text-xs text-muted-foreground">
        The war room for this file. Compare notes, argue it out.
      </p>

      {canPost ? (
        <div className="mb-6">
          <PostComposer boardId={boardId} meName={meName} onPosted={addPost} />
        </div>
      ) : (
        <p className="mb-6 font-mono text-xs text-muted-foreground">
          Initiate to weigh in on this case.
        </p>
      )}

      {tree.length ? (
        <div className="space-y-3">
          {tree.map((node) => (
            <PostItem
              key={node.id}
              node={node}
              boardId={boardId}
              canPost={canPost}
              meName={meName}
              onReplied={addPost}
              depth={0}
            />
          ))}
        </div>
      ) : (
        <p className="font-mono text-xs text-muted-foreground">
          No case-notes yet. Someone has to go first.
        </p>
      )}
    </section>
  );
}
