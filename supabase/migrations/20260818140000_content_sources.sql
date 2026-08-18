-- UC-012 · Learner-owned content sources (T-W9).
--
-- Rows appear on `/content` when saved from method setup with "Keep in library".
-- Session-only paste uses an ephemeral cookie instead — no row here.
--
-- Docs: docs/specs/feature/word-capture.md

create table public.content_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  language_code text not null,
  kind text not null check (kind in ('text', 'audio')),
  title text not null,
  body text,
  transcript text,
  tags text[],
  source_url text,
  added_at timestamptz not null default now(),
  constraint content_sources_text_or_transcript check (
    (kind = 'text' and body is not null and char_length(trim(body)) > 0)
    or (kind = 'audio' and transcript is not null and char_length(trim(transcript)) > 0)
  )
);

comment on table public.content_sources is
  'Learner-saved text and audio sources (UC-012). Catalogue/fixture sources stay in data/content/.';

create index content_sources_user_language_idx
  on public.content_sources (user_id, language_code, added_at desc);

alter table public.content_sources enable row level security;

grant select, insert on public.content_sources to authenticated;
revoke all on public.content_sources from anon;

create policy "content_sources_select_own" on public.content_sources
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "content_sources_insert_own" on public.content_sources
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);
