# Form-mastery signal

<!-- id: SPEC-service-form-mastery-signal -->
<!-- use-case: UC-041 -->
<!-- status: active -->

Pool-local **form-mastery** reading for Progress — how many form-recall Tasks
in the shipped deck are held stably. Answers UC-041's requirement that form
gaps are reported separately from vocabulary size.

Parent: [`form-recall-pool.md`](form-recall-pool.md),
[`progress.md`](../page/progress.md), [`study/03`](../../study/03-level-model.md)
§ The second axis.

## Scope

- **In:** `readFormMastery` in `lib/level-model.ts`; `poolForDisplay` includes
  the form-recall deck for the active language; Progress copy and rendering.
- **Out:** per-cell or per-pattern breakdown (UC-062 spec gap); feeding speaking
  or writing skills; Italian form-recall pool; paradigm-table method.

## Behavior

| # | Input | Output |
| --- | --- | --- |
| 1 | Progress read, active language has a form-recall pool | `form-mastery` signal uses form-recall Tasks only |
| 2 | No form-recall Task has been reviewed | Signal status `no-data` |
| 3 | At least one form-recall Task reviewed | Status `has-data`; `value` = held count; `taskCount` = form-recall pool size |
| 4 | Vocabulary-size signal | Counts meaning-recall Tasks only — form-recall Tasks excluded from both value and pool size |
| 5 | Recall-stability signal | Unchanged — averages stability across all reviewed Tasks |

## Acceptance criteria

- [ ] Given the shipped Spanish form-recall pool and no form-recall reviews,
      when `/progress` renders, then form mastery shows *nothing recorded yet*.
- [ ] Given form-recall review history, when `/progress` renders, then form
      mastery shows *N of M starter forms held stably* and names that it is
      separate from vocabulary size.
- [ ] Given only meaning-recall reviews, when vocabulary size renders, then
      `taskCount` is the meaning-recall pool size (2000), not the combined pool.
- [ ] Given zero held forms after reviews, when form mastery renders, then the
      held count may be zero and the signal still reads *recorded*.
- [ ] **Negative:** form-mastery value never includes meaning-recall Tasks.

## Check

`npm test -- level-model progress form-recall-pool`
