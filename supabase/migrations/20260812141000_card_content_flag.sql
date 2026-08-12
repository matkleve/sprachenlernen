-- UC-023 · Learner-reported broken card content, scoped per spoken language.
--
-- Key is (user_id, word_id, spoken_language) — a report is about one
-- description text for one word, not the word in the abstract (UC-069).
--
-- Docs: docs/specs/service/broken-card-detection.md

create table public.card_content_flag (
  user_id uuid not null references auth.users (id) on delete cascade,
  word_id text not null,
  spoken_language text not null,
  flagged_at timestamptz not null default now(),
  primary key (user_id, word_id, spoken_language)
);

comment on table public.card_content_flag is
  'Learner flags on card description text (UC-023). Excluded from next session onward.';

create index card_content_flag_user_id_idx on public.card_content_flag (user_id);

alter table public.card_content_flag enable row level security;

grant select, insert on public.card_content_flag to authenticated;
revoke all on public.card_content_flag from anon;

create policy "card_content_flag_select_own" on public.card_content_flag
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "card_content_flag_insert_own" on public.card_content_flag
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);
