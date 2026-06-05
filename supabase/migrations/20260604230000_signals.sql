-- REDTHREAD :: 0016 :: signals (The Wire) + nodes.signal_id FK
-- Cached items from external public feeds (USGS quakes, OpenSky flights, GDELT
-- events, NASA APOD). Public-read; an authed operative caches a signal when they
-- pin it. Snapshots/refresh happen server-side (no client UPDATE granted).

create type public.signal_source as enum ('usgs', 'opensky', 'gdelt', 'nasa');

create table public.signals (
  id          uuid primary key default gen_random_uuid(),
  source      public.signal_source not null,
  external_id text not null,
  kind        text not null,                       -- earthquake | flight | event | apod
  title       text not null,
  body        text,
  url         text,
  lat         double precision,
  lon         double precision,
  magnitude   double precision,                    -- quake mag / generic numeric
  occurred_at timestamptz,
  metadata    jsonb not null default '{}',
  created_at  timestamptz not null default now(),
  unique (source, external_id)
);
comment on table public.signals is 'Cached external-feed items (The Wire), pinnable onto boards as evidence.';

create index idx_signals_source_time on public.signals(source, occurred_at desc nulls last);

alter table public.signals enable row level security;

create policy signals_select_all on public.signals for select using (true);
create policy signals_insert_authed on public.signals for insert
  with check ((select auth.uid()) is not null);

-- Wire the deferred FK from nodes → signals (Phase 2 left signal_id unconstrained;
-- all existing values are null, so this is safe to add now).
alter table public.nodes
  add constraint nodes_signal_id_fkey
  foreign key (signal_id) references public.signals(id) on delete set null;
