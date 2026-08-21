# Chrome i18n — remaining content.ts stragglers

<!-- id: SPEC-service-chrome-i18n-stragglers -->
<!-- use-case: UC-069 -->
<!-- status: active -->

T-B11e wired most chrome through `next-intl`, but a handful of shipped surfaces
still read English-only strings from feature `content.ts` files. When
`spoken_language` is `de`, those surfaces stay in English — a parity gap, not
missing keys in `messages/de.json`.

Parent: [`spoken-language.md`](spoken-language.md), [`I18N.md`](../../I18N.md) § Stage 1.

## Scope

- **In:** migrate these shipped surfaces to `messages/{en,de}.json` and
  `useTranslations` / `getTranslations`:
  - review card report popover ([`review-card-report.md`](../feature/review-card-report.md))
  - demonstration sentence on `/methods` ([`demonstration-sentence.md`](../feature/demonstration-sentence.md))
  - reading gloss dialog on content detail ([`reading-surface.md`](../feature/reading-surface.md))
  - weekly reflection entry row + deck chrome + builder headlines
    ([`weekly-reflection.md`](../feature/weekly-reflection.md))
- **Out:** language-status marketing page (large static table — separate pass);
  safari-bisect, brand-explorer, design-explorer dev surfaces; card gloss text
  (stage 3 — [`gloss-resolver.md`](gloss-resolver.md)).

## Behavior

| # | Input | System response |
| --- | --- | --- |
| 1 | `spoken_language` `de` on `/methods` | Demonstration sentence labels, flip hint, grade row, and feedback render in German |
| 2 | `spoken_language` `de` during review, card report open | Popover title, categories, note field, and actions render in German |
| 3 | `spoken_language` `de` on a content detail with reading body | “Read” heading, gloss dialog close, and empty-gloss line render in German |
| 4 | `spoken_language` `de` on `/progress` with a weekly reflection | Row label, deck controls, card headlines/teasers, and chart captions render in German |
| 5 | Key added to `messages/en.json` | Same key exists in `messages/de.json` before merge (`check-i18n-keys`) |

## Acceptance criteria

See [`chrome-i18n-stragglers.acceptance-criteria.md`](chrome-i18n-stragglers.acceptance-criteria.md).

## Check

`node scripts/check-i18n-keys.mjs` · `npm test -- card-report-popover demonstration-sentence readable-text weekly-reflection`
