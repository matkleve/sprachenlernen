# Gloss resolver

<!-- id: SPEC-service-gloss-resolver -->
<!-- use-case: UC-069 -->
<!-- status: active -->

Framework-free service that turns a **`descriptionKey`** plus the account's
**spoken language** into the string a learner reads on a card face, in reading
glosses, content-gap lists, and anywhere else target content is described in
the language they speak. Consumes [`app-texts.md`](app-texts.md) snapshot JSON;
never queries the database per card at runtime.

Parent: [`spoken-language.md`](spoken-language.md).

## Scope

- **In:** `lib/gloss-resolver.ts` — `resolveDescription(key, spokenLanguage)`;
  batch `resolveDescriptions(keys, spokenLanguage)` for session build; load
  snapshot maps from `data/i18n/descriptions/<locale>.json`; fallback chain
  (requested locale → `source_lang` from EN snapshot → empty).
- **Out:** choosing which key a card carries (pool + [`starter-deck.md`](starter-deck.md));
  importing or editing `app_texts`; chrome `t()` strings; translating target
  lemmas on card fronts.

## Behavior

| # | Input | Output |
| --- | --- | --- |
| 1 | `descriptionKey` + `spoken_language` `de` | Published German string from `de.json` |
| 2 | Key missing in `de.json` | English string from `en.json` or `source_text` |
| 3 | Key missing everywhere | `""` and debug log — never the raw key on screen |
| 4 | `spoken_language` equals `source_lang` | Source snapshot row (English today) |
| 5 | Session build for 15 cards | One batch load per locale; no per-card file read |

### Surfaces that must use this resolver (not `card.back`)

| Surface | Key source |
| --- | --- |
| Review session — meaning-recall back | `card.descriptionKey` |
| Review session — form-recall front | `card.descriptionKey` |
| Reading tap-to-gloss | same keys as pool glosses |
| Content-gap lemma list | same keys |
| Word orbit / detail gloss line | same keys |
| Demonstration sentence translation | `sentence.{id}.translation` |

Switching spoken language re-renders all of the above without touching review
state.

## States

Not a UI machine. Pure functions over in-memory maps.

## Data

| Field | Owner |
| --- | --- |
| `descriptionKey` | starter / form-recall pool JSON |
| Snapshot JSON | [`app-texts.md`](app-texts.md) export |
| `spoken_language` | `public.profiles` |

**Migration note:** while pools still ship `back` during transition, resolver
may accept `back` as a dev-only fallback when `descriptionKey` is absent —
removed once T-W15 slice 3c ships.

## Acceptance criteria

In [`gloss-resolver.acceptance-criteria.md`](gloss-resolver.acceptance-criteria.md).

## Check

`npm test -- gloss-resolver`
