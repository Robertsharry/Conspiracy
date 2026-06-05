-- REDTHREAD :: 0013 :: full-text search
-- Generated tsvector columns + GIN indexes over boards and nodes. to_tsvector
-- with a literal config is immutable, so it is valid in a generated column.

alter table public.boards
  add column if not exists search_tsv tsvector
  generated always as (
    to_tsvector(
      'english',
      coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(verdict, '')
    )
  ) stored;
create index if not exists idx_boards_search on public.boards using gin (search_tsv);

alter table public.nodes
  add column if not exists search_tsv tsvector
  generated always as (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, ''))
  ) stored;
create index if not exists idx_nodes_search on public.nodes using gin (search_tsv);
