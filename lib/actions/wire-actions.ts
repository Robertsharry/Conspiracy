"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const WireItemSchema = z.object({
  source: z.enum(["usgs", "opensky", "gdelt", "nasa"]),
  externalId: z.string().min(1).max(400),
  kind: z.string().min(1).max(40),
  title: z.string().min(1).max(300),
  body: z.string().max(4000).nullable().optional(),
  url: z.string().max(1000).nullable().optional(),
  lat: z.number().nullable().optional(),
  lon: z.number().nullable().optional(),
  magnitude: z.number().nullable().optional(),
  occurredAt: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Pin a Wire signal onto a board as a `type='signal'` node. Caches the signal row
 * (insert-if-new) to satisfy the FK, then inserts the pin — board access is
 * enforced by RLS on `nodes`. Realtime pushes the new pin to everyone watching.
 */
export async function pinSignal(input: {
  boardId: string;
  item: unknown;
}): Promise<{ ok: true; nodeId: string } | { error: string }> {
  const board = z.string().uuid().safeParse(input.boardId);
  if (!board.success) return { error: "Pick a board." };
  const parsed = WireItemSchema.safeParse(input.item);
  if (!parsed.success) return { error: "Malformed signal." };
  const it = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Initiate to pin a signal." };

  await supabase.from("signals").upsert(
    {
      source: it.source,
      external_id: it.externalId,
      kind: it.kind,
      title: it.title,
      body: it.body ?? null,
      url: it.url ?? null,
      lat: it.lat ?? null,
      lon: it.lon ?? null,
      magnitude: it.magnitude ?? null,
      occurred_at: it.occurredAt ?? null,
      metadata: it.metadata ?? {},
    },
    { onConflict: "source,external_id", ignoreDuplicates: true },
  );

  const { data: sig } = await supabase
    .from("signals")
    .select("id")
    .eq("source", it.source)
    .eq("external_id", it.externalId)
    .single();
  if (!sig) return { error: "Could not cache the signal." };

  // Drop the pin somewhere visible; the user can drag it after.
  const x = 40 + Math.round(Math.random() * 220);
  const y = 40 + Math.round(Math.random() * 160);

  const { data: node, error } = await supabase
    .from("nodes")
    .insert({
      board_id: board.data,
      type: "signal",
      title: it.title,
      body: it.body ?? null,
      source_url: it.url ?? null,
      signal_id: sig.id,
      x,
      y,
      created_by: user.id,
      metadata: it.metadata ?? {},
    })
    .select("id")
    .single();

  if (error || !node) {
    return { error: "Could not pin to that board — do you have access?" };
  }
  revalidatePath("/boards");
  return { ok: true, nodeId: node.id };
}
