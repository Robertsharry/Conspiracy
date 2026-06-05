-- REDTHREAD :: 0007 :: realtime
-- Add the board graph tables to the realtime publication so postgres_changes
-- fires for live pins/strings/notes. Changes still respect each table's RLS,
-- so subscribers only receive rows they're allowed to read.

alter publication supabase_realtime add table public.nodes;
alter publication supabase_realtime add table public.edges;
alter publication supabase_realtime add table public.posts;
