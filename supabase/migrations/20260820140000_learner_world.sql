-- UC-019 · Lernwelt preference per learning language (study/56).
-- Docs: docs/specs/service/learner-world.md

create table public.learner_world (
  user_id uuid not null references auth.users (id) on delete cascade,
  language_code text not null,
  world_id text not null check (world_id in (
    'business', 'everyday', 'technical', 'politics', 'nature', 'general'
  )),
  set_at timestamptz not null default now(),
  primary key (user_id, language_code)
);

comment on table public.learner_world is
  'Active Lernwelt per account and learning language (UC-019).';

create index learner_world_user_id_idx on public.learner_world (user_id);

alter table public.learner_world enable row level security;

grant select, insert, update on public.learner_world to authenticated;
revoke all on public.learner_world from anon;

create policy "learner_world_select_own" on public.learner_world
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "learner_world_insert_own" on public.learner_world
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "learner_world_update_own" on public.learner_world
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
