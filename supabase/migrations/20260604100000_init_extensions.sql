-- REDTHREAD :: 0001 :: extensions
-- Foundational Postgres extensions used across the schema.
--   citext   — case-insensitive UNIQUE for shadow_name handles and slugs.
--   pgcrypto — cryptographic helpers (gen_random_uuid is core in PG13+, kept for parity).

create extension if not exists citext with schema extensions;
create extension if not exists pgcrypto with schema extensions;
