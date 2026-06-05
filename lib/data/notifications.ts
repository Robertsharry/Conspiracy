import { createClient } from "@/lib/supabase/server";

export type NotificationKind = "mention" | "reply" | "inmail";

export interface NotificationRow {
  id: string;
  kind: NotificationKind;
  body: string | null;
  link: string;
  read_at: string | null;
  created_at: string;
  actor_name: string | null;
}

/** How many unread intercepts the current operative has (0 for anon). */
export async function getUnreadCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .is("read_at", null);
  return count ?? 0;
}

/** The current operative's intercepts, newest first. RLS scopes to recipient. */
export async function listNotifications(): Promise<NotificationRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select(
      "id, kind, body, link, read_at, created_at, actor:profiles!notifications_actor_id_fkey(shadow_name)",
    )
    .order("created_at", { ascending: false })
    .limit(60);

  return ((data ?? []) as Array<{
    id: string;
    kind: NotificationKind;
    body: string | null;
    link: string;
    read_at: string | null;
    created_at: string;
    actor: unknown;
  }>).map((n) => {
    const a = (Array.isArray(n.actor) ? n.actor[0] : n.actor) as
      | { shadow_name?: string }
      | undefined;
    return {
      id: n.id,
      kind: n.kind,
      body: n.body,
      link: n.link,
      read_at: n.read_at,
      created_at: n.created_at,
      actor_name: a?.shadow_name ?? null,
    };
  });
}
