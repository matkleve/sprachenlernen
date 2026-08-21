# Coverage

<!-- id: SPEC-service-coverage -->
<!-- use-case: UC-007 -->
<!-- use-case: UC-034 -->
<!-- use-case: UC-033 -->
<!-- use-case: UC-059 -->
<!-- status: active -->

Lemma-level **coverage** over a Source: what fraction of tokens resolve to lemmas
the learner holds. Framework-free. Built on
[`lexicon.md`](lexicon.md) `buildLexicon()`.

Parent loop: [`content-traceability.md`](../feature/content-traceability.md).
Gap list UI: [`content-gap.md`](../feature/content-gap.md).

## Scope

- **In:** `lib/coverage.ts` (name TBD) — tokenise, resolve, count known lemmas;
  item-level and window-level coverage; comfort-band classification; reverse
  index lemma→source ids; fixture source loading; snapshot rows for K2 history.
- **Out:** scheduling gap sets (content-gap feature); reading/listening UI;
  translation; ASR; learner intake persistence (T-W9); method-gap copy (UC-059
  consumes this service but owns its own surface).

## Behavior

| # | Input | Output |
| --- | --- | --- |
| 1 | Source body/transcript + held-lemma set | `coveragePercent` (0–100, one decimal), `tokenCount`, `knownCount` |
| 2 | Same + thresholds | `comfortBand`: `demanding` (&lt;95), `comfortable` (95–98), `speed` (&gt;98) |
| 3 | Audio source + window size (default 60 s of transcript) | `windowCoverage[]` — best window first ([`../../study/STUDY-015-own-content.md`](../../study/STUDY-015-own-content.md) A1; [`../../study/archive/ARCH-046-method-length-and-level-matched-content.md`](../../study/archive/ARCH-046-method-length-and-level-matched-content.md)) |
| 4 | Held-lemma set + all sources for language | `lemmaSources: Map<lemma, sourceId[]>` for word trace block |
| 5 | Sources for language + topic `id` | Filtered list, best learner coverage first — method chip preview |
| 6 | Coverage recompute after reviews | Append `{ measuredAt, coveragePercent, calibrationDated }` to source history |
| 7 | Ambiguous token | Count lemma **known** if **any** analysis’s lemma is held (optimistic; logged at debug only) |
| 8 | Fused form (`del`) | Each part resolved separately; each token position counts once toward denominator |
| 9 | Unknown / unlisted form | Counts toward denominator; never counts as known |

### Counting rules

- **Denominator:** content tokens after tokenisation, excluding pure punctuation.
  Proper nouns are not special-cased in v1 — they count like any unlisted form.
- **Numerator:** token positions whose resolved lemma (or any fused part’s lemma)
  is in the held set.
- **Unit:** lemma, matching pool-local held tasks — not form mastery
  ([`lexicon.md`](lexicon.md) open note on form vs lemma ranks deferred).

### Fixture sources (read-only stub)

Ship `data/content/{lang}/*.json` — `catalogue` and `fixture` entries. At least
one short text per shipped learning language. `learner` entries from intake when
T-W9 ships; session-only paste may omit persistence (study/37).

## Data

| Field | Owner |
| --- | --- |
| `Source` records | DB table `content_sources` for learner saves; fixture/catalogue in `data/` |
| `coverage_history` rows | DB — Sensitive; `source_id`, `measured_at`, `coverage_percent`, `calibration_dated` |
| Held-lemma set | derived per request from review log + starter pool |

## Acceptance criteria

In [`coverage.acceptance-criteria.md`](coverage.acceptance-criteria.md).

## Check

`npm test -- coverage`
