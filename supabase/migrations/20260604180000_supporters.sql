-- REDTHREAD :: 0011 :: supporters (The Black Budget)
-- Benefactors. A separate table that everyone can READ but NObody can self-write:
-- a tier is granted by the service role or a future payment webhook, never by the
-- operative themselves (so the flair actually means something).

create table public.supporters (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  tier    text not null default 'informant',  -- 'informant' | 'handler' | 'architect'
  since   timestamptz not null default now()
);
comment on table public.supporters is 'Benefactors. Read-only to clients; granted via service role / payment webhook.';

alter table public.supporters enable row level security;

-- World-readable (the Wall of Patrons + dossier flair). No write policies, so
-- only the service role (or a migration) can grant or change a tier.
create policy supporters_select_all on public.supporters for select using (true);
