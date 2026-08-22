-- UC-033 · Coverage history snapshots for K2 unlock rollup (T-W11b).
--
-- Per-source coverage rows after held-lemma changes. User-scoped RLS.
-- source_id is text — fixture/catalogue ids are not UUIDs.
--
-- Docs: docs/specs/service/coverage.md

create table public.coverage_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  language_code text not null,
  source_id text not null,
  measured_at timestamptz not null default now(),
  coverage_percent numeric(5, 1) not null,
  calibration_dated text,
  constraint coverage_history_percent_range check (
    coverage_percent >= 0 and coverage_percent <= 100
  )
);

comment on table public.coverage_history is
  'Lemma-coverage snapshots per saved source (UC-033). Sensitive — K2 before/after lines.';

create index coverage_history_user_language_idx
  on public.coverage_history (user_id, language_code, measured_at desc);

create index coverage_history_user_source_idx
  on public.coverage_history (user_id, source_id, measured_at desc);

alter table public.coverage_history enable row level security;

grant select, insert on public.coverage_history to authenticated;
revoke all on public.coverage_history from anon;

create policy "coverage_history_select_own" on public.coverage_history
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "coverage_history_insert_own" on public.coverage_history
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);
