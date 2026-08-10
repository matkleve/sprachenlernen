-- T-B2 follow-up · client review_id for idempotent flush retries.
-- Docs: docs/specs/service/review-write-queue.md

alter table public.review_log
  add column review_id uuid;

create unique index review_log_user_review_id_idx
  on public.review_log (user_id, review_id)
  where review_id is not null;

comment on column public.review_log.review_id is
  'Client-generated idempotency key for offline queue flush (ADR-0005).';
