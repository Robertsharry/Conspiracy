-- REDTHREAD :: 0003 :: boards, nodes, edges, posts, votes, tags
-- The core graph. A Board (case file) holds Nodes (pins) connected by Edges
-- (red string). Posts are threaded case-notes on a board or a node. Votes are
-- Corroborate/Discredit. Boards carry editorial "canon" fields (plausibility,
-- verdict, category) so the Phase 5 saturation content drops straight in.

-- ── enums ────────────────────────────────────────────────────────────────────
create type public.board_category as enum (
  'conspiracy', 'disappearance', 'event', 'phenomenon', 'coverup', 'person', 'other'
);
create type public.board_visibility as enum ('public', 'unlisted', 'private');
create type public.board_status     as enum ('open', 'cold', 'closed');
create type public.node_type as enum (
  'theory', 'person', 'event', 'document', 'location', 'media', 'claim', 'signal'
);
create type public.edge_kind as enum (
  'connects', 'supports', 'contradicts', 'causes', 'alias_of', 'funds', 'located_at', 'timeline'
);
create type public.vote_target as enum ('node', 'edge', 'post');
create type public.vote_value  as enum ('corroborate', 'discredit');

-- ── boards (case files) ──────────────────────────────────────────────────────
create table public.boards (
  id            uuid primary key default gen_random_uuid(),
  slug          citext unique not null,
  title         text not null,
  summary       text,
  cover_url     text,
  category      public.board_category not null default 'conspiracy',
  visibility    public.board_visibility not null default 'public',
  status        public.board_status not null default 'open',
  -- editorial canon (Phase 5): OUR assessment
  is_canon      boolean not null default false,   -- official canon vs user-created
  plausibility  smallint,                         -- our rating 0–100 (null = unrated)
  verdict       text,                             -- our one-line assessment
  featured_rank integer,                          -- manual ordering for "top" (lower = higher)
  created_by    uuid references public.profiles(id) on delete set null,  -- null = system/canon
  node_count    integer not null default 0,
  post_count    integer not null default 0,
  watcher_count integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  constraint boards_plausibility_range
    check (plausibility is null or (plausibility between 0 and 100))
);
comment on table public.boards is 'Case files — a board of pinned evidence connected by red string.';

-- ── nodes (pins) ─────────────────────────────────────────────────────────────
create table public.nodes (
  id          uuid primary key default gen_random_uuid(),
  board_id    uuid not null references public.boards(id) on delete cascade,
  type        public.node_type not null default 'claim',
  title       text not null,
  body        text,
  x           double precision not null default 0,    -- react-flow canvas coords
  y           double precision not null default 0,
  rotation    real not null default 0,                -- polaroid tilt (deg)
  width       real,                                   -- persisted for SSR-friendly measure
  height      real,
  media_url   text,
  source_url  text,                                   -- citation / FOIA link-out
  signal_id   uuid,                                   -- FK to signals added in Phase 3
  metadata    jsonb not null default '{}',            -- type-specific extras (lat/lng, dates…)
  score       integer not null default 0,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
comment on table public.nodes is 'Pins on a board: theories, people, events, documents, media, claims, signals.';

-- ── edges (red string) ───────────────────────────────────────────────────────
create table public.edges (
  id             uuid primary key default gen_random_uuid(),
  board_id       uuid not null references public.boards(id) on delete cascade,  -- denormalized for RLS speed
  source_node_id uuid not null references public.nodes(id) on delete cascade,
  target_node_id uuid not null references public.nodes(id) on delete cascade,
  label          text,
  kind           public.edge_kind not null default 'connects',
  score          integer not null default 0,
  created_by     uuid references public.profiles(id) on delete set null,
  created_at     timestamptz not null default now(),
  deleted_at     timestamptz,
  constraint edges_no_self_loop check (source_node_id <> target_node_id),
  constraint edges_unique_pair unique (source_node_id, target_node_id, kind)
);
comment on table public.edges is 'Connections between pins — the red string.';

-- ── posts (case-notes) ───────────────────────────────────────────────────────
create table public.posts (
  id          uuid primary key default gen_random_uuid(),
  board_id    uuid not null references public.boards(id) on delete cascade,
  node_id     uuid references public.nodes(id) on delete cascade,   -- null = board-level thread
  parent_id   uuid references public.posts(id) on delete cascade,   -- null = top-level
  body        text not null,
  score       integer not null default 0,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
comment on table public.posts is 'Threaded case-notes on a board (or a specific pin).';

-- ── votes (corroborate / discredit) ──────────────────────────────────────────
create table public.votes (
  id          uuid primary key default gen_random_uuid(),
  voter_id    uuid not null references public.profiles(id) on delete cascade,
  target_type public.vote_target not null,
  target_id   uuid not null,
  value       public.vote_value not null,
  created_at  timestamptz not null default now(),
  constraint votes_unique_per_target unique (voter_id, target_type, target_id)
);

-- ── tags ─────────────────────────────────────────────────────────────────────
create table public.tags (
  id    uuid primary key default gen_random_uuid(),
  slug  citext unique not null,
  label text not null
);
create table public.board_tags (
  board_id uuid not null references public.boards(id) on delete cascade,
  tag_id   uuid not null references public.tags(id) on delete cascade,
  primary key (board_id, tag_id)
);

-- ── visibility helper (used by child-table RLS) ──────────────────────────────
create or replace function public.can_read_board(b_id uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.boards b
    where b.id = b_id
      and b.deleted_at is null
      and (b.visibility = 'public' or b.created_by = (select auth.uid()))
  );
$$;

-- ── triggers ─────────────────────────────────────────────────────────────────
-- touch_updated_at() already exists (profiles migration).
create trigger boards_touch_updated_at before update on public.boards
  for each row execute function public.touch_updated_at();
create trigger nodes_touch_updated_at before update on public.nodes
  for each row execute function public.touch_updated_at();
create trigger posts_touch_updated_at before update on public.posts
  for each row execute function public.touch_updated_at();

-- Corroborate/Discredit → maintain target score + author credibility.
create or replace function public.apply_vote()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  delta  integer := 0;
  ttype  public.vote_target;
  tid    uuid;
  author uuid;
begin
  if (tg_op = 'INSERT') then
    delta := case when new.value = 'corroborate' then 1 else -1 end;
    ttype := new.target_type; tid := new.target_id;
  elsif (tg_op = 'DELETE') then
    delta := case when old.value = 'corroborate' then -1 else 1 end;
    ttype := old.target_type; tid := old.target_id;
  else
    delta := (case when new.value = 'corroborate' then 1 else -1 end)
           - (case when old.value = 'corroborate' then 1 else -1 end);
    ttype := new.target_type; tid := new.target_id;
  end if;

  if delta = 0 then return null; end if;

  if ttype = 'post' then
    update public.posts set score = score + delta where id = tid returning created_by into author;
  elsif ttype = 'node' then
    update public.nodes set score = score + delta where id = tid returning created_by into author;
  elsif ttype = 'edge' then
    update public.edges set score = score + delta where id = tid returning created_by into author;
  end if;

  if author is not null then
    update public.profiles set credibility = credibility + delta where id = author;
  end if;
  return null;
end;
$$;
create trigger votes_apply after insert or update or delete on public.votes
  for each row execute function public.apply_vote();

-- Denormalized counts for feed/archive cards.
create or replace function public.bump_board_node_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.boards set node_count = node_count + 1 where id = new.board_id;
  elsif tg_op = 'DELETE' then
    update public.boards set node_count = greatest(node_count - 1, 0) where id = old.board_id;
  end if;
  return null;
end; $$;
create trigger nodes_bump_count after insert or delete on public.nodes
  for each row execute function public.bump_board_node_count();

create or replace function public.bump_board_post_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.boards set post_count = post_count + 1 where id = new.board_id;
  elsif tg_op = 'DELETE' then
    update public.boards set post_count = greatest(post_count - 1, 0) where id = old.board_id;
  end if;
  return null;
end; $$;
create trigger posts_bump_count after insert or delete on public.posts
  for each row execute function public.bump_board_post_count();

-- ── indexes (FKs + RLS-referenced + hot queries) ─────────────────────────────
create index idx_boards_created_by      on public.boards(created_by);
create index idx_boards_public_recent   on public.boards(created_at desc) where visibility = 'public' and deleted_at is null;
create index idx_boards_canon_rank      on public.boards(plausibility desc nulls last, featured_rank asc nulls last) where is_canon and deleted_at is null;
create index idx_boards_category        on public.boards(category) where deleted_at is null;
create index idx_nodes_board_id         on public.nodes(board_id) where deleted_at is null;
create index idx_nodes_created_by       on public.nodes(created_by);
create index idx_edges_board_id         on public.edges(board_id) where deleted_at is null;
create index idx_edges_source           on public.edges(source_node_id);
create index idx_edges_target           on public.edges(target_node_id);
create index idx_posts_board_id         on public.posts(board_id) where deleted_at is null;
create index idx_posts_node_id          on public.posts(node_id);
create index idx_posts_parent_id        on public.posts(parent_id);
create index idx_votes_target           on public.votes(target_type, target_id);
create index idx_board_tags_tag         on public.board_tags(tag_id);
