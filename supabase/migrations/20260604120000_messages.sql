-- REDTHREAD :: 0005 :: messages (InMail)
-- Discreet, async 1:1 messages between operatives. NOT live chat — email-like.
-- Either party can read a message; only the sender can create one; only the
-- recipient can update it (to mark it read).

create table public.messages (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  subject      text,
  body         text not null,
  read_at      timestamptz,
  created_at   timestamptz not null default now(),
  deleted_at   timestamptz,
  constraint messages_no_self check (sender_id <> recipient_id)
);
comment on table public.messages is 'InMail — discreet async 1:1 messages between operatives.';

create index idx_messages_recipient on public.messages(recipient_id, created_at desc) where deleted_at is null;
create index idx_messages_sender    on public.messages(sender_id, created_at desc)    where deleted_at is null;
create index idx_messages_pair      on public.messages(sender_id, recipient_id, created_at);

alter table public.messages enable row level security;

-- read: only the two parties
create policy messages_select_party on public.messages for select
  using ((select auth.uid()) = sender_id or (select auth.uid()) = recipient_id);

-- create: only as yourself, to someone else
create policy messages_insert_sender on public.messages for insert
  with check ((select auth.uid()) = sender_id and sender_id <> recipient_id);

-- update: only the recipient (e.g. mark read)
create policy messages_update_recipient on public.messages for update
  using ((select auth.uid()) = recipient_id)
  with check ((select auth.uid()) = recipient_id);
