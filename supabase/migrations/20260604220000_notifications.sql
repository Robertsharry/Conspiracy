-- REDTHREAD :: 0015 :: notifications ("Intercepts")
-- When your shadow name comes up in a case-note (@mention) or someone replies to
-- your note, a notification fires. Rows are written ONLY by a SECURITY DEFINER
-- trigger (no client insert policy) so notifications can never be forged.

create type public.notification_kind as enum ('mention', 'reply', 'inmail');

create table public.notifications (
  id           uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id     uuid references public.profiles(id) on delete set null,
  kind         public.notification_kind not null,
  board_id     uuid references public.boards(id) on delete cascade,
  post_id      uuid references public.posts(id) on delete cascade,
  body         text,
  link         text not null,
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);
comment on table public.notifications is 'Per-user intercepts: @mentions and replies. Written only by trigger / service role.';

create index idx_notifications_recipient on public.notifications(recipient_id, created_at desc);
create index idx_notifications_unread on public.notifications(recipient_id) where read_at is null;

alter table public.notifications enable row level security;

-- You can read and mark-read only your own intercepts. No insert/delete policy:
-- the trigger below (SECURITY DEFINER) is the only writer.
create policy notifications_select_own on public.notifications for select
  using (recipient_id = (select auth.uid()));
create policy notifications_update_own on public.notifications for update
  using (recipient_id = (select auth.uid()))
  with check (recipient_id = (select auth.uid()));

-- ── fan-out trigger: parse @mentions + reply target on every new post ─────────
create or replace function public.handle_post_mentions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- @mentions: match shadow-name handles in the body, resolve to profiles.
  -- shadow_name is citext, so the IN comparison is case-insensitive.
  insert into public.notifications (recipient_id, actor_id, kind, board_id, post_id, body, link)
  select p.id, new.created_by, 'mention', new.board_id, new.id,
         left(new.body, 160), '/boards/' || b.slug
  from public.profiles p
  join public.boards b on b.id = new.board_id
  where p.shadow_name in (
          select (regexp_matches(new.body, '@([a-zA-Z0-9_.-]{3,24})', 'g'))[1]
        )
    and p.id is distinct from new.created_by;

  -- reply: notify the parent note's author (unless self, or already @mentioned).
  if new.parent_id is not null then
    insert into public.notifications (recipient_id, actor_id, kind, board_id, post_id, body, link)
    select parent.created_by, new.created_by, 'reply', new.board_id, new.id,
           left(new.body, 160), '/boards/' || b.slug
    from public.posts parent
    join public.boards b on b.id = new.board_id
    where parent.id = new.parent_id
      and parent.created_by is not null
      and parent.created_by is distinct from new.created_by
      and not exists (
        select 1 from public.notifications n
        where n.post_id = new.id
          and n.recipient_id = parent.created_by
          and n.kind = 'mention'
      );
  end if;

  return new;
end;
$$;

create trigger trg_post_mentions
  after insert on public.posts
  for each row execute function public.handle_post_mentions();
