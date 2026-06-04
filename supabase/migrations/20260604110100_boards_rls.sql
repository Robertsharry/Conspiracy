-- REDTHREAD :: 0004 :: RLS for boards/nodes/edges/posts/votes/tags
-- Default-deny + explicit policies. Public boards are world-readable; children
-- (nodes/edges/posts) inherit board visibility via can_read_board(). Writes
-- require auth and ownership. Canon rows (created_by null) are inserted via the
-- service role / seed and are read-only to users.
-- The (select auth.uid()) form keeps it a single initPlan eval per query.

alter table public.boards     enable row level security;
alter table public.nodes      enable row level security;
alter table public.edges      enable row level security;
alter table public.posts      enable row level security;
alter table public.votes      enable row level security;
alter table public.tags       enable row level security;
alter table public.board_tags enable row level security;

-- ── boards ──
create policy boards_select on public.boards for select
  using (deleted_at is null and (visibility = 'public' or created_by = (select auth.uid())));
create policy boards_insert_authed on public.boards for insert
  with check ((select auth.uid()) is not null and created_by = (select auth.uid()));
create policy boards_update_owner on public.boards for update
  using (created_by = (select auth.uid())) with check (created_by = (select auth.uid()));

-- ── nodes ──
create policy nodes_select on public.nodes for select
  using (deleted_at is null and public.can_read_board(board_id));
create policy nodes_insert_authed on public.nodes for insert
  with check ((select auth.uid()) is not null and created_by = (select auth.uid()) and public.can_read_board(board_id));
create policy nodes_update_owner on public.nodes for update
  using (created_by = (select auth.uid())) with check (created_by = (select auth.uid()));

-- ── edges ──
create policy edges_select on public.edges for select
  using (deleted_at is null and public.can_read_board(board_id));
create policy edges_insert_authed on public.edges for insert
  with check ((select auth.uid()) is not null and created_by = (select auth.uid()) and public.can_read_board(board_id));
create policy edges_update_owner on public.edges for update
  using (created_by = (select auth.uid())) with check (created_by = (select auth.uid()));

-- ── posts (case-notes) ──
create policy posts_select on public.posts for select
  using (deleted_at is null and public.can_read_board(board_id));
create policy posts_insert_authed on public.posts for insert
  with check ((select auth.uid()) is not null and created_by = (select auth.uid()) and public.can_read_board(board_id));
create policy posts_update_owner on public.posts for update
  using (created_by = (select auth.uid())) with check (created_by = (select auth.uid()));

-- ── votes (a user manages only their own) ──
create policy votes_all_own on public.votes for all
  using (voter_id = (select auth.uid())) with check (voter_id = (select auth.uid()));

-- ── tags (world-read; board owners tag their own boards) ──
create policy tags_select_all on public.tags for select using (true);
create policy board_tags_select_all on public.board_tags for select using (true);
create policy board_tags_write_owner on public.board_tags for all
  using (exists (select 1 from public.boards b where b.id = board_id and b.created_by = (select auth.uid())))
  with check (exists (select 1 from public.boards b where b.id = board_id and b.created_by = (select auth.uid())));
