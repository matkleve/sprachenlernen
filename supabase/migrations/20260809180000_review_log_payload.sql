-- T-B2 · Review log payload columns.
--
-- Appends to 20260809073100_review_log_ownership.sql — never edit that file.
-- Docs: docs/specs/service/review-log.md, ADR-0004, ADR-0005.

alter table public.review_log
  add column task_id text,
  add column grade text,
  add column reviewed_at timestamptz,
  add column latency_ms integer;

-- T-B8 smoke-test rows carried ownership only; they are not learner data.
delete from public.review_log;

alter table public.review_log
  alter column task_id set not null,
  alter column grade set not null,
  alter column reviewed_at set not null,
  alter column latency_ms set not null;

alter table public.review_log
  add constraint review_log_grade_check
  check (grade in ('again', 'hard', 'good', 'easy'));

alter table public.review_log
  add constraint review_log_latency_ms_nonneg
  check (latency_ms >= 0);

comment on column public.review_log.task_id is
  'Opaque task identifier — scheduler Task.id (ADR-0004).';
comment on column public.review_log.grade is
  'Learner self-grade: again | hard | good | easy.';
comment on column public.review_log.reviewed_at is
  'Client-reported answer time (untrusted). Maps to scheduler Review.at on read.';
comment on column public.review_log.latency_ms is
  'Milliseconds from card shown to grade tapped. Export field (UC-024); FSRS ignores it.';

create index review_log_user_task_reviewed_at_idx
  on public.review_log (user_id, task_id, reviewed_at);
