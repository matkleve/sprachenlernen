-- UC-069 · One spoken language per account (chrome + card descriptions).
--
-- Singleton preference — unlike learner_language (one-to-many), this is 1:1
-- with auth.users and gets its own table rather than a column on auth.
--
-- Docs: docs/specs/service/spoken-language.md, ADR-0012 decision 10.

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  spoken_language text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Account singleton preferences (UC-069). spoken_language drives chrome and description lookup.';
comment on column public.profiles.spoken_language is
  'BCP-47 primary subtag. v1 ships en and de.';

alter table public.profiles enable row level security;

grant select, insert, update on public.profiles to authenticated;
revoke all on public.profiles from anon;

create policy "profiles_select_own" on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "profiles_insert_own" on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "profiles_update_own" on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
