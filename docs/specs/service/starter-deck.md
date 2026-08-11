# Starter deck

<!-- id: SPEC-service-starter-deck -->
<!-- use-case: UC-011 -->
<!-- status: active -->

The frequency-ranked lemma pool that seeds a learner's first SRS sessions.
**Standard** (`AGENTS.md`) — data plus a loader; no UI.

## Scope

- **In:** `data/starter/es-meaning-recall.json` (shipped pool), optional
  `data/starter/es-meaning-recall.overrides.json` (hand-checked glosses),
  `scripts/build-starter-deck.mjs` (regenerator), `lib/starter-deck.ts`
  (load + validate).
- **Out:** Italian or a second language; form-recall or audio tasks; runtime
  gloss generation; language-wide vocabulary extrapolation (still blocked on
  pool size + calibration — see [`page/progress.md`](../page/progress.md));
  choosing which lemmas enter the pool at review time (the pool is fixed per
  release).

## Behavior

| # | Input | Output |
| --- | --- | --- |
| 1 | Shipped JSON | Validates and returns a deck: language, task type, cards |
| 2 | Invalid JSON | Error list; no deck |
| 3 | Regenerator run | Rewrites the JSON from frequency data + lemma table + gloss sources |

## States

Not a UI machine. `loadSpanishMeaningRecallDeck` is synchronous.

## Data

**Stage 1 pool (shipped):** **500** Spanish lemmas, task type
`meaning-recall`, ordered by descending aggregated form frequency.

| Field | Type | Notes |
| --- | --- | --- |
| `taskId` | `string` | `es:{lemma}:meaning-recall` |
| `wordId` | `string` | `es:{lemma}` |
| `lemma` | `string` | Canonical lemma from the lemma table |
| `front` | `string` | v1: same as `lemma` |
| `back` | `string` | English gloss — build-time, never runtime |
| `frequencyRank` | `number` | 1 = most frequent in pool |

**Lemma selection (build script):**

1. Read `data/frequency/es.txt` (form counts).
2. Resolve each form through `data/lemma/es.json`; skip fused forms.
3. Sum form counts per lemma; sort descending.
4. Take the top **500** unique lemmas.

**Gloss provenance (build script):**

1. Hand-checked overrides in `es-meaning-recall.overrides.json` win.
2. Else first English gloss from Kaikki.org Spanish dictionary (CC BY-SA 3.0),
   cached at build time in `.cache/gloss/`.
3. Else the build fails — no card ships without a gloss.

Fused forms and unknown forms that resolve to themselves are included when
frequent enough; the pool follows subtitle register, not textbook vocabulary.

## Acceptance criteria

In [`starter-deck.acceptance-criteria.md`](starter-deck.acceptance-criteria.md).

## Check

`npm test -- starter-deck`

## Open

- **Stage 2 (2k lemmas)** — same pipeline, larger cap; blocked on gloss QA
  bandwidth, not code.
- **Lemma-frequency recomputation** — summing form counts into lemma ranks is
  deliberate but is a calibration event when the level model extrapolates
  ([`lexicon.md`](lexicon.md) Open).
