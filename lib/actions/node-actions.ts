"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const NODE_TYPES = [
  "theory",
  "person",
  "event",
  "document",
  "location",
  "media",
  "claim",
  "signal",
] as const;

export type CreateNodeResult = { id: string } | { error: string };
export type MutateResult = { ok: true } | { error: string };
export type CreateEdgeResult = { id: string } | { error: string };

const CreateNodeSchema = z.object({
  boardId: z.string().uuid(),
  type: z.enum(NODE_TYPES),
  title: z.string().trim().min(1).max(160),
  body: z.string().trim().max(2000).optional(),
  x: z.number(),
  y: z.number(),
});

/** Pin a new node to a board. Returns the new id for optimistic reconciliation. */
export async function createNode(input: {
  boardId: string;
  type: string;
  title: string;
  body?: string;
  x: number;
  y: number;
}): Promise<CreateNodeResult> {
  const parsed = CreateNodeSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Initiate to pin evidence." };

  const { data, error } = await supabase
    .from("nodes")
    .insert({
      board_id: parsed.data.boardId,
      type: parsed.data.type,
      title: parsed.data.title,
      body: parsed.data.body ?? null,
      x: parsed.data.x,
      y: parsed.data.y,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Could not pin that." };
  return { id: data.id };
}

const MoveNodeSchema = z.object({
  id: z.string().uuid(),
  x: z.number(),
  y: z.number(),
  rotation: z.number().optional(),
});

/** Persist a pin's position (and optional rotation) after a drag. */
export async function moveNode(input: {
  id: string;
  x: number;
  y: number;
  rotation?: number;
}): Promise<MutateResult> {
  const parsed = MoveNodeSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const update: Record<string, number> = { x: parsed.data.x, y: parsed.data.y };
  if (parsed.data.rotation !== undefined) update.rotation = parsed.data.rotation;

  const { error } = await supabase
    .from("nodes")
    .update(update)
    .eq("id", parsed.data.id);
  if (error) return { error: error.message };
  return { ok: true };
}

const CreateEdgeSchema = z.object({
  boardId: z.string().uuid(),
  source: z.string().uuid(),
  target: z.string().uuid(),
  label: z.string().trim().max(120).optional(),
});

/** Draw a red string between two pins. */
export async function createEdge(input: {
  boardId: string;
  source: string;
  target: string;
  label?: string;
}): Promise<CreateEdgeResult> {
  const parsed = CreateEdgeSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (parsed.data.source === parsed.data.target) {
    return { error: "A pin can't connect to itself." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Initiate to draw connections." };

  const { data, error } = await supabase
    .from("edges")
    .insert({
      board_id: parsed.data.boardId,
      source_node_id: parsed.data.source,
      target_node_id: parsed.data.target,
      label: parsed.data.label ?? null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    if (error?.code === "23505") return { error: "Those two are already connected." };
    return { error: error?.message ?? "Could not draw that string." };
  }
  return { id: data.id };
}
