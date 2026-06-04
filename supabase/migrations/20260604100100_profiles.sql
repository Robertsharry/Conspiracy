-- REDTHREAD :: 0002 :: profiles
-- Pseudonymous identities, 1:1 with auth.users. A new auth user automatically
-- gets a profile with a placeholder shadow_name; they claim a real one during
-- initiation (Phase 1). The clearance rank ladder is flavor/credibility — NOT
-- a hard access gate in v1.

-- ── Clearance rank ladder ────────────────────────────────────────────────────
create type public.clearance_rank as enum (
  'sheeple',     -- fresh initiate
  'awakened',    -- has started connecting dots
  'researcher',  -- contributes evidence
  'watchman',    -- trusted, high credibility
  'handler',     -- community steward
  'architect'    -- the ones who see the whole board
);

-- ── profiles table ───────────────────────────────────────────────────────────
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  shadow_name  citext unique not null,
  display_name text,
  rank         public.clearance_rank not null default 'sheeple',
  credibility  integer not null default 0,
  bio          text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.profiles is
  'Pseudonymous user profiles, 1:1 with auth.users. shadow_name is the public handle.';

-- ── updated_at touch trigger (reused by later tables) ────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ── auto-provision a profile for every new auth user ─────────────────────────
-- Runs as SECURITY DEFINER so the signup transaction can insert the profile
-- regardless of the caller. search_path pinned to public for safety.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, shadow_name)
  values (
    new.id,
    'operative-' || substr(replace(new.id::text, '-', ''), 1, 8)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Row Level Security ───────────────────────────────────────────────────────
-- Profiles are world-readable (pseudonymity is the privacy model); a user may
-- only update or insert their own row. The (select auth.uid()) form ensures a
-- single initplan evaluation per query rather than once per row.
alter table public.profiles enable row level security;

create policy profiles_select_all
  on public.profiles
  for select
  using (true);

create policy profiles_insert_self
  on public.profiles
  for insert
  with check ((select auth.uid()) = id);

create policy profiles_update_self
  on public.profiles
  for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
