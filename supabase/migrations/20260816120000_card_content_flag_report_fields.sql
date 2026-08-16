-- UC-073 · Optional category and note on learner card reports.
--
-- Docs: docs/specs/service/broken-card-detection.md

alter table public.card_content_flag
  add column category text,
  add column note text;

alter table public.card_content_flag
  add constraint card_content_flag_category_check
  check (
    category is null
    or category in (
      'wrong-translation',
      'audio',
      'confusing',
      'not-relevant',
      'other'
    )
  );

alter table public.card_content_flag
  add constraint card_content_flag_note_length_check
  check (note is null or char_length(note) <= 280);
