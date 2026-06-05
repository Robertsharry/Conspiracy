import { createClient } from "@/lib/supabase/server";

export interface InmailThread {
  otherId: string;
  otherName: string;
  lastBody: string;
  lastAt: string;
  unread: number;
  lastOutgoing: boolean;
}

export interface InmailMessage {
  id: string;
  body: string;
  subject: string | null;
  created_at: string;
  mine: boolean;
}

/** Total unread InMail for the current operative (for the nav indicator). */
export async function getUnreadInmailCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;
  const { count } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", user.id)
    .is("read_at", null)
    .is("deleted_at", null);
  return count ?? 0;
}

/** Inbox: one entry per counterparty, newest first, with unread counts. */
export async function getInmailThreads(): Promise<InmailThread[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("messages")
    .select("id, sender_id, recipient_id, body, read_at, created_at")
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as Array<{
    id: string;
    sender_id: string;
    recipient_id: string;
    body: string;
    read_at: string | null;
    created_at: string;
  }>;

  const threads = new Map<string, InmailThread>();
  for (const m of rows) {
    const otherId = m.sender_id === user.id ? m.recipient_id : m.sender_id;
    if (!threads.has(otherId)) {
      threads.set(otherId, {
        otherId,
        otherName: "",
        lastBody: m.body,
        lastAt: m.created_at,
        unread: 0,
        lastOutgoing: m.sender_id === user.id,
      });
    }
    if (m.recipient_id === user.id && !m.read_at) {
      threads.get(otherId)!.unread += 1;
    }
  }

  const ids = [...threads.keys()];
  if (ids.length) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, shadow_name")
      .in("id", ids);
    for (const p of (profs ?? []) as Array<{ id: string; shadow_name: string }>) {
      const t = threads.get(p.id);
      if (t) t.otherName = p.shadow_name;
    }
  }

  return [...threads.values()];
}

/** The full 1:1 conversation with another operative (by shadow name). */
export async function getConversation(
  otherShadowName: string,
): Promise<{ other: { id: string; name: string } | null; messages: InmailMessage[] }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { other: null, messages: [] };

  const { data: other } = await supabase
    .from("profiles")
    .select("id, shadow_name")
    .eq("shadow_name", otherShadowName)
    .maybeSingle();
  if (!other) return { other: null, messages: [] };

  const { data } = await supabase
    .from("messages")
    .select("id, sender_id, body, subject, created_at")
    .or(
      `and(sender_id.eq.${user.id},recipient_id.eq.${other.id}),and(sender_id.eq.${other.id},recipient_id.eq.${user.id})`,
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  const messages = (
    (data ?? []) as Array<{
      id: string;
      sender_id: string;
      body: string;
      subject: string | null;
      created_at: string;
    }>
  ).map((m) => ({
    id: m.id,
    body: m.body,
    subject: m.subject,
    created_at: m.created_at,
    mine: m.sender_id === user.id,
  }));

  return { other: { id: other.id, name: other.shadow_name }, messages };
}
