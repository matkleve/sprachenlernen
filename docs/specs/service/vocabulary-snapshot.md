# Vocabulary snapshot

<!-- id: SPEC-service-vocabulary-snapshot -->
<!-- use-case: UC-005 -->
<!-- status: active -->

Pure derivation of held/shaky/new counts, a 30-day review horizon, and atlas
points from the starter deck plus stored review history (study/04 G2–G3).

## Scope

- **In:** `lib/vocabulary-snapshot.ts` — `buildVocabularySnapshot`,
  `bucketForTask`; consumed by `features/words/reading.ts`.
- **Out:** causal horizon copy; chart interactivity; second decks; CEFR mapping.

## Behavior

| # | Input | Output |
| --- | --- | --- |
| 1 | Starter cards + reviews by task | Counts: held (stability > graduation), shaky (reviewed but not held), new (no reviews) |
| 2 | Rebuilt tasks + `now` | 30 bins of scheduled review counts by day offset from `now` |
| 3 | Each card | Atlas point: lemma, frequency rank, stability, bucket |

## States

Not applicable — pure function.

## Acceptance criteria

- [ ] Given no review history, when `buildVocabularySnapshot` runs, then every
      card is `new` and counts sum to the deck size.
- [ ] Given tasks above graduation stability, when bucketed, then they count as
      `held`.
- [ ] Given a task with reviews but stability at or below graduation, when
      bucketed, then it counts as `shaky`.

## Check

`npm test -- vocabulary-snapshot`
