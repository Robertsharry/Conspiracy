-- REDTHREAD :: 0014 :: reports (moderation queue)
-- Operatives can FILE a report (insert as themselves); only the service role can
-- READ/triage the queue (no select policy for clients). "The Protocols" in
-- action — see docs/SECURITY_AND_MODERATION.md.

create type public.report_status as enum ('open', 'reviewing', 'actioned', 'dismissed');

create table public.reports (
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete set null,
  target_type text not null,                 -- 'board' | 'node' | 'edge' | 'post'
  target_id   uuid not null,
  reason      text not null,
  details     text,
  status      public.report_status not null default 'open',
  created_at  timestamptz not null default now(),
  resolved_at timestamptz
);
comment on table public.reports is 'Moderation queue. Insert by authed users; read/triage by service role only.';

create index idx_reports_status on public.reports(status, created_at desc);

alter table public.reports enable row level security;

-- File a report as yourself. No select/update policy → the queue is service-role only.
create policy reports_insert_authed on public.reports for insert
  with check ((select auth.uid()) is not null and reporter_id = (select auth.uid()));
