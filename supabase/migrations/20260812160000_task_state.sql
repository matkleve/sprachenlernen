-- Task state materialization — one row per task per user, updated on each grade.
-- Docs: docs/specs/service/task-state.md, docs/adr/0005.

create table public.task_state (
  user_id          uuid not null references auth.users (id) on delete cascade,
  task_id          text not null,
  word_id          text not null,
  state            text not null,
  stability        double precision,
  difficulty       double precision not null default 5.0,
  due              timestamptz not null,
  last_review_at   timestamptz,
  lapses           integer not null default 0,
  last_grade       text,
  review_count     integer not null default 0,
  weights_version  text not null,
  updated_at       timestamptz not null default now(),
  primary key (user_id, task_id),
  constraint task_state_state_check check (
    state in ('learning', 'review', 'relearning', 'suspended', 'retired')
  ),
  constraint task_state_grade_check check (
    last_grade is null or last_grade in ('again', 'hard', 'good', 'easy')
  ),
  constraint task_state_review_count_positive check (review_count > 0),
  constraint task_state_lapses_nonneg check (lapses >= 0)
);

comment on table public.task_state is
  'Materialized FSRS state per task (SPEC-service-task-state). Absence means new.';

create index task_state_user_due_idx on public.task_state (user_id, due);
create index task_state_user_state_idx on public.task_state (user_id, state);

alter table public.task_state enable row level security;

grant select, insert, update on public.task_state to authenticated;
revoke all on public.task_state from anon;

create policy "task_state_select_own" on public.task_state
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "task_state_insert_own" on public.task_state
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "task_state_update_own" on public.task_state
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Atomic append: review_log insert + task_state upsert in one transaction.
-- FSRS is computed in application code; this function only persists both sides.
create or replace function public.append_review_with_task_state(
  p_installation_id uuid,
  p_task_id text,
  p_word_id text,
  p_grade text,
  p_reviewed_at timestamptz,
  p_latency_ms integer,
  p_review_id uuid,
  p_state text,
  p_stability double precision,
  p_difficulty double precision,
  p_due timestamptz,
  p_last_review_at timestamptz,
  p_lapses integer,
  p_review_count integer,
  p_weights_version text
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_row_id uuid;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  insert into public.review_log (
    user_id,
    installation_id,
    task_id,
    grade,
    reviewed_at,
    latency_ms,
    review_id
  )
  values (
    v_user_id,
    p_installation_id,
    p_task_id,
    p_grade,
    p_reviewed_at,
    p_latency_ms,
    p_review_id
  )
  returning id into v_row_id;

  insert into public.task_state (
    user_id,
    task_id,
    word_id,
    state,
    stability,
    difficulty,
    due,
    last_review_at,
    lapses,
    last_grade,
    review_count,
    weights_version,
    updated_at
  )
  values (
    v_user_id,
    p_task_id,
    p_word_id,
    p_state,
    p_stability,
    p_difficulty,
    p_due,
    p_last_review_at,
    p_lapses,
    p_grade,
    p_review_count,
    p_weights_version,
    now()
  )
  on conflict (user_id, task_id) do update set
    word_id = excluded.word_id,
    state = excluded.state,
    stability = excluded.stability,
    difficulty = excluded.difficulty,
    due = excluded.due,
    last_review_at = excluded.last_review_at,
    lapses = excluded.lapses,
    last_grade = excluded.last_grade,
    review_count = excluded.review_count,
    weights_version = excluded.weights_version,
    updated_at = now();

  return v_row_id;
end;
$$;

grant execute on function public.append_review_with_task_state(
  uuid, text, text, text, timestamptz, integer, uuid,
  text, double precision, double precision, timestamptz, timestamptz,
  integer, integer, text
) to authenticated;
