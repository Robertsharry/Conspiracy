"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const SendSchema = z.object({
  toShadowName: z.string().trim().min(1).max(24),
  subject: z.string().trim().max(160).optional(),
  body: z.string().trim().min(1, "Say something.").max(8000, "Too long."),
});

export type SendResult = { id: string; to: string } | { error: string };

/** Send a discreet 1:1 InMail to another operative (by shadow name). */
export async function sendInmail(input: {
  toShadowName: string;
  subject?: string;
  body: string;
}): Promise<SendResult> {
  const parsed = SendSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Initiate to send InMail." };

  const { data: recipient } = await supabase
    .from("profiles")
    .select("id, shadow_name")
    .eq("shadow_name", parsed.data.toShadowName)
    .maybeSingle();
  if (!recipient) return { error: "No operative answers to that shadow name." };
  if (recipient.id === user.id) return { error: "You can't send to yourself." };

  const { data, error } = await supabase
    .from("messages")
    .insert({
      sender_id: user.id,
      recipient_id: recipient.id,
      subject: parsed.data.subject ?? null,
      body: parsed.data.body,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "The drop failed. Try again." };
  return { id: data.id, to: recipient.shadow_name };
}

/** Mark all messages from `otherShadowName` to the current user as read. */
export async function markInmailRead(otherShadowName: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: other } = await supabase
    .from("profiles")
    .select("id")
    .eq("shadow_name", otherShadowName)
    .maybeSingle();
  if (!other) return;

  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", user.id)
    .eq("sender_id", other.id)
    .is("read_at", null);
}
