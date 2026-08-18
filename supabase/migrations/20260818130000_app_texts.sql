-- UC-069 slice 3 · Learner-facing description text (card glosses, sentence translations).
--
-- Runtime serves snapshot JSON (data/i18n/descriptions/*.json); these tables
-- are the authoring store and seed target. Contract:
-- docs/specs/service/app-texts.md

create table public.languages (
  code text primary key,
  name text not null
);

comment on table public.languages is
  'Shipped spoken-language codes for app_text_translations.lang (I18N.md stage 3).';

insert into public.languages (code, name) values
  ('en', 'English'),
  ('de', 'Deutsch');

create table public.app_texts (
  id uuid primary key default gen_random_uuid(),
  text_key text not null unique,
  source_text text not null,
  source_lang text not null default 'en' references public.languages (code),
  context text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.app_texts is
  'Stable keys for learner-facing description copy (UC-069 slice 3).';

create table public.app_text_translations (
  id uuid primary key default gen_random_uuid(),
  app_text_id uuid not null references public.app_texts (id) on delete cascade,
  lang text not null references public.languages (code),
  translated_text text not null,
  status text not null default 'draft'
    check (status in ('draft', 'reviewed', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (app_text_id, lang)
);

comment on column public.app_text_translations.status is
  'App reads published rows only — exported to snapshot JSON at build.';

create index app_text_translations_lang_status_idx
  on public.app_text_translations (lang, status);

alter table public.languages enable row level security;
alter table public.app_texts enable row level security;
alter table public.app_text_translations enable row level security;

grant select on public.languages to authenticated, anon;
grant select on public.app_texts to authenticated, anon;

-- Published learner copy is world-readable; draft/reviewed stay hidden.
grant select on public.app_text_translations to authenticated, anon;

create policy "languages_read_all" on public.languages
  for select
  to authenticated, anon
  using (true);

create policy "app_texts_read_all" on public.app_texts
  for select
  to authenticated, anon
  using (true);

create policy "app_text_translations_read_published" on public.app_text_translations
  for select
  to authenticated, anon
  using (status = 'published');
