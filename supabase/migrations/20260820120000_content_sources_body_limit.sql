-- UC-012 · A ceiling on learner-saved source text.
--
-- Appends to 20260818140000_content_sources.sql — never edit that file.
--
-- `body` and `transcript` shipped unbounded while the neighbouring
-- `card_content_flag.note` was capped at 280 chars in its own migration. So
-- one signed-in account could write rows of arbitrary size, and every later
-- read handed the coverage tokeniser the whole thing. The adapter now refuses
-- oversize text before the round trip (lib/learner-text-limits.ts); this is
-- the layer that still holds when a future adapter forgets, which is the same
-- reason review_log's append-only rule is a missing grant *and* a missing
-- policy rather than a convention.
--
-- 100 000 characters is a long article or a book chapter. The number is not
-- load-bearing — having one is.
--
-- **Not reversible** in the sense that matters: dropping the constraint is one
-- line, but any row written while it was absent stays as it was.
--
-- Docs: docs/specs/feature/word-capture.md

alter table public.content_sources
  add constraint content_sources_body_length_check
  check (body is null or char_length(body) <= 100000);

alter table public.content_sources
  add constraint content_sources_transcript_length_check
  check (transcript is null or char_length(transcript) <= 100000);

comment on constraint content_sources_body_length_check on public.content_sources is
  'Mirrors LEARNER_SOURCE_MAX_BODY_CHARS in lib/learner-text-limits.ts. Change both.';
