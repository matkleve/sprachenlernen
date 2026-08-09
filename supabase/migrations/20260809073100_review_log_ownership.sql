-- T-B8 · Review log ownership and row-level security.
--
-- Scope, deliberately narrow: this migration commits to exactly the four
-- properties ADR-0005 and ADR-0006 already fixed — the review's own UUID, its
-- non-null owner, the installation it came from, and append-only. It does NOT
-- pin the review's payload (word, task, grade, latency, timestamp) — that row
-- schema is T-B2's job (ADR-0007). Adding those columns later is a normal
-- `alter table`, never a rewrite of this file (BACKEND.md §5 — migrations are
-- append-only; this one is not reversible by design, since dropping it would
-- delete every review a learner has recorded).
--
-- Docs: docs/specs/service/auth.md, docs/adr/0005, docs/adr/0006, docs/adr/0007.

create table public.review_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  installation_id uuid not null,
  created_at timestamptz not null default now()
);

comment on table public.review_log is
  'Append-only review log (ADR-0005). Row schema beyond ownership is T-B2''s job.';
comment on column public.review_log.user_id is
  'The account that recorded this review. Non-null from the first row (ADR-0006).';
comment on column public.review_log.installation_id is
  'The browser/device the review was written from (ADR-0005) — for de-dup on sync, never a device fingerprint.';

create index review_log_user_id_idx on public.review_log (user_id);

alter table public.review_log enable row level security;

-- Supabase does not expose a newly created table to `anon`/`authenticated`
-- automatically (see .agents/skills/supabase/SKILL.md). Grant only what an
-- authenticated owner needs, and grant `authenticated` — never `anon` — since
-- ADR-0006 makes an account mandatory before any row exists.
grant select, insert on public.review_log to authenticated;
revoke all on public.review_log from anon;

-- Ownership, enforced at the row level rather than trusted to application code
-- (BACKEND.md §2 — "the client is untrusted"). `to authenticated` alone would
-- be authentication without authorization (any signed-in user could read any
-- row); the `using`/`with check` predicate is what makes it authorization.
create policy "review_log_select_own" on public.review_log
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "review_log_insert_own" on public.review_log
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- No update or delete grant and no update or delete policy, for either role —
-- two independent layers, verified together against a local Postgres before
-- this migration reached the live project (see the PR): the missing GRANT
-- makes Postgres refuse the statement outright ("permission denied",
-- confirmed locally) before RLS is even consulted, and the missing policy
-- would deny it again if a future migration ever added the grant back. That
-- redundancy is deliberate: it is the enforcement of "append-only" (ADR-0005),
-- not a convention nobody's query has broken yet. A correction is a new row,
-- per the Review/Task model (ADR-0004), never an edit to an old one.
