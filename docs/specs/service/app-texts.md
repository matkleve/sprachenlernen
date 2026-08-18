# App texts

<!-- id: SPEC-service-app-texts -->
<!-- use-case: UC-069 -->
<!-- status: active -->

Stage-3 copy store for **learner-facing description text** — card glosses,
form-recall prompts, example-sentence translations, and any other string that
describes target-language content in the **spoken language** the account uses.
App chrome stays stage 1 (`next-intl` JSON). Contract:
[`I18N.md`](../../I18N.md) § Stage 3, [ADR-0012](../../adr/0012-ux-decisions-requeue-i18n-leech-nav.md)
decisions 10–11.

Parent: [`spoken-language.md`](spoken-language.md) (which locale to read).

## Scope

- **In:** `public.app_texts` + `public.app_text_translations`; stable
  `text_key` per logical string; `status` workflow (`draft` → `reviewed` →
  `published`); seed import from shipped starter pools and demonstration
  sentences; snapshot export to `data/i18n/descriptions/<locale>.json` at build;
  RLS (read published only for learners; service role for import).
- **Out:** chrome strings in `messages/*.json`; runtime machine translation per
  request; editing UI for copywriters (v1 is seed + SQL/CSV import); translating
  **target-language** lemmas on card fronts.

## Text keys

One stable key per translatable string. Keys are **not** locale-specific —
translations hang off the key.

| Pattern | Example | Source text lang | Notes |
| --- | --- | --- | --- |
| `card.{wordId}.{taskType}.{face}` | `card.it:fare.meaning-recall.back` | `en` | Meaning-recall gloss |
| `card.{wordId}.{taskType}.{face}` | `card.es:hablar.form-recall.front` | `en` | Whole form-recall prompt face |
| `sentence.{id}.text` | `sentence.it-oggi-voglio-andare.text` | target lang | Target-language sentence body |
| `sentence.{id}.translation` | `sentence.it-oggi-voglio-andare.translation` | `en` | Spoken-language translation of sentence |

`wordId` and `taskType` match the pool (`it:fare`, `meaning-recall`). One string
per card face per spoken language — no split definition / hint / instruction
fields for v1 ([ADR-0012](../../adr/0012-ux-decisions-requeue-i18n-leech-nav.md)
decision 11).

Pool JSON stops carrying locale strings. It carries **`descriptionKey`** (and
optional `exampleSentenceKey`) — the lookup handle, never the gloss itself.

## Behavior

| # | Input | System response |
| --- | --- | --- |
| 1 | Build / cache invalidation | Exports all **published** translations per locale to snapshot JSON |
| 2 | Render with `descriptionKey` + `spoken_language` `de` | Returns German `translated_text` when published |
| 3 | Missing locale row | Falls back to `source_text` (`source_lang`, usually `en`) |
| 4 | Missing key entirely | Falls back to English snapshot row if present; else empty + telemetry |
| 5 | Import seed | Upserts `app_texts` from current `back`/`front` English; does not touch `taskId` or reviews |
| 6 | MT pipeline | Writes `draft` rows for non-source locales; app never reads `draft` |

## States

Translation row lifecycle — not a UI machine.

| Status | App reads? | Terminal? |
| --- | --- | --- |
| `draft` | no | no |
| `reviewed` | no | no |
| `published` | yes | yes |

## Data

```sql
create table public.app_texts (
  id uuid primary key default gen_random_uuid(),
  text_key text not null unique,
  source_text text not null,
  source_lang text not null default 'en',
  context text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
```

`public.languages` holds shipped codes (`en`, `de`, …) — no `check (lang in …)`
on translations ([`I18N.md`](../../I18N.md)).

Snapshot: one JSON file per locale under `data/i18n/descriptions/`. Example
`en.json`: `"card.it:fare.meaning-recall.back": "to do"`. Example `de.json`:
`"card.it:fare.meaning-recall.back": "tun"`. Resolver loads the file for
`spoken_language` at process start.

## Acceptance criteria

In [`app-texts.acceptance-criteria.md`](app-texts.acceptance-criteria.md).

## Check

`npm test -- app-texts`

## Open

- ⚠ **Snapshot commit vs CI-only artefact** — default: committed so `verify`
  runs without DB; invalidate on translation publish via build hook.
