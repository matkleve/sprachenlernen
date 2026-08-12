# Vocabulary snapshot

<!-- id: SPEC-service-vocabulary-snapshot -->
<!-- use-case: UC-005 -->
<!-- status: active -->

Pure derivation of held/fragile/new counts, a 30-day review horizon, and atlas
points from the starter deck plus stored review history (study/04 G2–G3).

**Calibration 2026-08-12:** `held` no longer uses the scheduler's graduation
threshold (1 day). Graduation moves a task into day-scale intervals; **held**
means stable enough to count as known — see `heldStabilityThreshold` in
[`scheduler.md`](scheduler.md).

## Scope

- **In:** `lib/vocabulary-snapshot.ts` — `buildVocabularySnapshot`,
  `bucketForTask`, `isTaskHeld`; consumed by `features/words/reading.ts`.
- **Out:** causal horizon copy; chart interactivity; second decks; CEFR mapping.

## Behavior

| # | Input | Output |
| --- | --- | --- |
| 1 | Starter cards + reviews by task | Counts: `held`, `fragile` (reviewed but not held), `new` (no reviews) |
| 2 | Rebuilt tasks + `now` | 30 bins of scheduled review counts by day offset from `now` |
| 3 | Each card | Atlas point: lemma, frequency rank, stability, bucket, `mature` flag |

### Held (counts toward vocabulary size and form-recall staging)

A task is **held** when all of the following hold:

1. State is `review` (not `learning`, `relearning`, or terminal).
2. Stability ≥ `heldStabilityThreshold` (default **7** days at target retention).
3. At least **two** successful grades (`hard`, `good`, or `easy`) in the log.
4. The latest grade is not `again`.

`graduationStability` (default 1 day) is **not** used here — one lucky answer
in the learning phase must not count as known.

### Fragile

Reviewed at least once, but not held — including tasks still in `learning` or
`relearning`, tasks below the held stability threshold, tasks with only one
success, and tasks whose latest grade was `again`.

### Mature (atlas only)

Atlas points carry `mature: true` when the task is held and stability ≥
`matureStabilityThreshold` (default **21** days). Mature is a display tier on the
atlas, not a fourth count column.

## States

Not applicable — pure function.

## Acceptance criteria

- [ ] Given no review history, when `buildVocabularySnapshot` runs, then every
      card is `new` and counts sum to the deck size.
- [ ] Given a task with one `good` grade, when bucketed, then it counts as
      `fragile`, not `held`.
- [ ] Given a task in `review` with stability ≥ held threshold, at least two
      successes, and no trailing `again`, when bucketed, then it counts as
      `held`.
- [ ] Given a task with reviews that fails any held rule, when bucketed, then
      it counts as `fragile`.
- [ ] Given a held task with stability ≥ mature threshold, when the atlas is
      built, then `mature` is true on that point.

## Check

`npm test -- vocabulary-snapshot`
