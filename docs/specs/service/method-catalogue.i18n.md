# Method catalogue — spoken-language copy

<!-- id: SPEC-service-method-catalogue-i18n -->
<!-- use-case: UC-069 -->
<!-- status: active -->

Stage-1 localization for **learner-facing method catalogue prose** — `name`,
`summary`, `trains`, and `doesNotDo` on cards and detail pages. English remains
the canonical source in `data/methods/*.json`; German lives in
`messages/de.json` under `methodMenu.entries.<id>`. Contract:
[`I18N.md`](../../I18N.md) § Stage 1, [`spoken-language.md`](spoken-language.md),
UC-069 success criteria ("method copy").

Parent: [`method-catalogue.md`](method-catalogue.md) (schema and validation).

## Scope

- **In:** resolver in `lib/localize-method-entry.ts`; client hook
  `useLocalizedMethod`; server helper `localizeMethodForLocale`; wiring on
  `MethodCard`, `MethodDetail`, `LandingPreviewMethodCard`, `/practice` runner
  title, and drill-in shell titles (`methodTitlesById`); German translations for
  every shipped entry id; sync script `scripts/sync-method-catalogue-i18n.mjs`
  that copies English from catalogue into `messages/en.json` for key parity;
  fallback to catalogue English when a locale row is missing.
- **Out:** translating catalogue **data** fields used for logic (`skills`,
  `requires`, `evidence`, ids); material topic `labelKey` strings (already in
  `methodMaterial`); stage-3 DB workflow for method copy; machine translation at
  runtime.

## Behavior

| # | Input | System response |
| --- | --- | --- |
| 1 | Locale `en` | Card and detail show catalogue JSON strings unchanged |
| 2 | Locale `de` with published row | Shows German `name`, `summary`, `trains`, `doesNotDo` |
| 3 | Locale `de`, missing one field | That field falls back to English catalogue string |
| 4 | Sync script run | `methodMenu.entries` in `en.json` mirrors catalogue; `de.json` holds German rows; key parity check passes |
| 5 | New method added to catalogue | Sync script fails or CI key check fails until DE row exists |

## Data

| Key path | Example | Source lang |
| --- | --- | --- |
| `methodMenu.entries.<id>.name` | `entries.background-listening.name` | en in JSON; de in messages |
| `methodMenu.entries.<id>.summary` | card subtitle | same |
| `methodMenu.entries.<id>.trains` | detail prose | same |
| `methodMenu.entries.<id>.doesNotDo` | honest limit prose | same |

`<id>` is the catalogue entry id (kebab-case). Commitments use the same shape.

## Acceptance criteria

See [`method-catalogue.i18n.acceptance-criteria.md`](method-catalogue.i18n.acceptance-criteria.md).

## Check

`npm test -- localize-method-entry method-menu` · `node scripts/check-i18n-keys.mjs`
