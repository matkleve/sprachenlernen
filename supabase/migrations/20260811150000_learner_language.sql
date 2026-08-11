-- UC-025 · Which languages an account is learning, and which one is in focus.
--
-- Two constraints below are load-bearing and are database facts rather than
-- adapter discipline, because both are the kind of rule application code
-- enforces correctly right up until the one path that forgot:
--
--   * one row per (account, language) — makes "add a language you already
--     have" idempotent instead of silently duplicating a learner's language;
--   * at most one active row per account — makes "exactly one language is in
--     focus" impossible to violate, including by a concurrent switch.
--
-- Deliberately absent: maintenance mode (UC-025), which needs the combined
-- daily budget to mean anything, and a column added now would be a guess about
-- its shape. Adding it later is a normal `alter table` (BACKEND.md §5).
--
-- No backfill is needed for existing history: review_log.task_id already
-- carries the language as its first segment ("es:el:meaning-recall"), so
-- Reviews partition per language without a column and without a rewrite.
--
-- Docs: docs/specs/service/learning-languages.md, docs/use-cases/UC-025.

create table public.learner_language (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  language_code text not null,
  is_active boolean not null default false,
  added_at timestamptz not null default now()
);

comment on table public.learner_language is
  'Languages an account is learning (UC-025). Several per account; exactly one active.';
comment on column public.learner_language.is_active is
  'Interface focus only. Must never filter what the session builder schedules — see the spec.';

create unique index learner_language_unique_per_account
  on public.learner_language (user_id, language_code);

-- Partial unique index: many inactive rows are fine, a second active one is not.
create unique index learner_language_one_active_per_account
  on public.learner_language (user_id)
  where is_active;

create index learner_language_user_id_idx on public.learner_language (user_id);

alter table public.learner_language enable row level security;

-- Supabase does not expose a new table to authenticated automatically. Grant
-- what an owner needs and nothing else; never anon, since ADR-0006 makes an
-- account mandatory before any of this exists.
grant select, insert, update, delete on public.learner_language to authenticated;
revoke all on public.learner_language from anon;

-- Unlike review_log, this table is mutable: switching the active language is an
-- update, and removing a language is a delete. That is not a weakening of
-- ADR-0005 — the append-only rule is about the *review log*, which is the
-- record of what happened. This table is a preference, and a preference that
-- could only be added to would be a bug.
create policy "learner_language_select_own" on public.learner_language
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "learner_language_insert_own" on public.learner_language
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "learner_language_update_own" on public.learner_language
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "learner_language_delete_own" on public.learner_language
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
