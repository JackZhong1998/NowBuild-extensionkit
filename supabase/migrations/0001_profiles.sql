-- Profiles are keyed by Clerk user ids (text).
-- The extension should never use the Supabase service role key.
-- The included Node API uses the service role server-side only.

create table if not exists public.profiles (
  id text primary key,
  email text,
  display_name text,
  avatar_url text,
  stripe_customer_id text,
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Deny direct client access by default. All access goes through your API using the service role.
drop policy if exists "profiles_deny_all" on public.profiles;
create policy "profiles_deny_all" on public.profiles for all using (false);
