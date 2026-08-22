# Form-mastery signal

<!-- id: SPEC-service-form-mastery-signal -->
<!-- use-case: UC-041 -->
<!-- status: active -->

Pool-local **form-mastery** reading for Progress — how many form-recall Tasks
in the shipped deck are held stably. Answers UC-041's requirement that form
gaps are reported separately from vocabulary size.

Parent: [`form-recall-pool.md`](form-recall-pool.md),
[`progress.md`](../page/progress.md), [`study/03`](../../study/STUDY-003-level-model.md)
§ The second axis.

## Scope

- **In:** `readFormMastery` in `lib/level-model.ts`; `readFormMasteryGroups` in
  `lib/form-mastery-groups.ts`; `poolForActiveLanguage` includes the form-recall
  deck for the active language; Progress copy, group breakdown table, and weak-group
  link to `deck=form` practice.
- **Out:** per-cell detail on Progress (T-W6 — inside form practice); feeding
  speaking or writing skills; paradigm-table method.

## Behavior

| # | Input | Output |
| --- | --- | --- |
| 1 | Progress read, active language has a form-recall pool | `form-mastery` signal uses form-recall Tasks only |
| 2 | No form-recall Task has been reviewed | Signal status `no-data` |
| 3 | At least one form-recall Task reviewed | Status `has-data`; `value` = held count; `taskCount` = form-recall pool size |
| 4 | Vocabulary-size signal | Counts meaning-recall Tasks only — form-recall Tasks excluded from both value and pool size |
| 5 | Recall-stability signal | Unchanged — averages stability across all reviewed Tasks |
| 6 | Verb lemma with an incomplete paradigm table (< 30 cells) and at least one held form-recall Task | `partialParadigmLemmaCount` increments; held count unchanged; Progress names the uncertainty |
| 7 | Form-recall pool loaded | Progress shows **cell group** breakdown: held vs total per pattern (verb class + tense, or nominal shape); weak groups link to `deck=form` review |

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
- [ ] Given a held form-recall Task on a verb lemma whose paradigm table is
      incomplete, when `/progress` renders, then the held count is unchanged and
      a footnote names how many held lemmas have partial paradigms.
- [ ] Given form-recall cards in the pool, when `/progress` renders, then a
      breakdown table lists each cell group with held and total counts.
- [ ] Given a cell group with fewer held forms than total, when `/progress`
      renders, then a link to `deck=form` practice is offered.

## Check

`npm test -- level-model progress form-recall-pool paradigm-completeness form-mastery-groups form-cell-groups`
