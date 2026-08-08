# Scheduler

<!-- id: SPEC-service-scheduler -->
<!-- use-case: UC-005 -->
<!-- status: draft -->

The memory model. Given a task's review history, it says how likely recall is
right now, when the task is next due, and what each possible answer would do to
that date. Framework-free: no React, no storage, no clock of its own.

Algorithm detail, weights and formulas: [`scheduler.algorithm.md`](scheduler.algorithm.md).
Data model: [ADR-0004](../../adr/0004-word-task-data-model.md).

## Scope

- **In:** per-task memory state (stability, difficulty, retrievability), the next
  due date, the projection for every grade, the task lifecycle state machine, and
  recomputing all of it from a review log.
- **Out:** which tasks make up a session and in what order (that is the session
  builder — it *consumes* this); the vocabulary estimate; anything that reads a
  wall clock; persistence; the UI that displays any of this.

The out-list matters: this module is a pure function of `(review log, now)`. It
never asks what time it is — the caller passes `now`. That is what makes the
projections testable and the recomputation in AC-9 possible.

## Behavior

| # | Input | Output |
| --- | --- | --- |
| 1 | A task with no reviews | state `new`, due immediately, stability undefined |
| 2 | A review with a grade | new memory state, a new due date, appended to the log |
| 3 | A task and `now` | retrievability as a probability in [0, 1] |
| 4 | A task and `now` | the interval each of the four grades would produce |
| 5 | A task whose consecutive lapses reach the threshold | state `suspended`, no due date |
| 6 | A full review log | the same state as replaying the reviews one at a time |
| 7 | Two tasks of one word, both due | the later one pushed out by the sibling gap |

Row 4 is the reason this spec exists rather than a scheduling library call: the
projections are shown to the learner *before* they answer (UC-005), so they must
be computable without mutating anything.

## States

One enum. Never a set of booleans — see [`../../STATE.md`](../../STATE.md) §2.

| State | Trigger | Effect | Terminal? |
| --- | --- | --- | --- |
| `new` | task created | due immediately; first review uses initial stability | no |
| `learning` | first review answered — **always**, even when initial stability already exceeds the graduation threshold | short intervals, minutes to days | no |
| `review` | stability passes the graduation threshold | intervals in days, growing | no |
| `relearning` | lapse from `review` | short intervals again; retains difficulty | no |
| `suspended` | consecutive lapses reach the threshold, **or** the learner suspends it | never scheduled; state frozen | no — reversible only by explicit repair or unsuspend (UC-013) |
| `retired` | the word is removed from the learner's set | never scheduled; log kept for export | **yes** |

Transition map, and everything absent from it is illegal:

```
new        → learning
learning   → review · suspended
review     → relearning · suspended · retired
relearning → review · suspended
suspended  → learning · retired
retired    → —
```

A move to the same state is not a transition and is legal — **except from a
terminal state**, where acting is a no-op by definition
([`../../STATE.md`](../../STATE.md)). There is no `new → review` edge: a first
answer always lands in `learning`, so one lucky guess cannot buy a multi-day
interval.

An illegal transition is a **no-op that reports**, never a silent fallthrough and
never a throw: the caller gets the unchanged state plus a reason. A scheduler
that throws mid-session loses the session.

`retired` is the only terminal state, and terminality is **derived** from the map
having no outgoing edges rather than kept as a second list that could drift.
`suspended` deliberately is not terminal — a suspended task returns as
`learning`, not as `review`, because whatever made it fail has not been
re-verified.

## Data

Reads a **review log**; that is the source of truth
([ADR-0004](../../adr/0004-word-task-data-model.md)).

| Field | Shape | Owner |
| --- | --- | --- |
| `taskId` | opaque string | caller |
| `reviews[]` | `{ at: epoch ms, grade }`, append-only | caller |
| `grade` | `"again" \| "hard" \| "good" \| "easy"` | caller |
| `state` | the enum above | **this module** — derived, never passed in |
| `stability`, `difficulty` | numbers | **this module** — derived |
| `due` | epoch ms | **this module** — derived |

Elapsed time is **not** stored on a review — it is the gap to the previous
review's `at`. A stored copy is a second source of truth for the same fact, and
the two drift the first time a review is corrected.

Everything this module owns is **derived from the log**. Nothing persists a
memory state as truth. That is what makes recalibration honest rather than a
migration ([`../../studie/03-level-modell.md`](../../studie/03-level-modell.md),
rule 4) — and it is the property AC-9 checks.

## Acceptance criteria

- [ ] AC-1 · Given a task with no reviews, when its state is computed, then it is
      `new` and due at or before `now`.
- [ ] AC-2 · Given any task and grade, when the grade is applied, then stability
      for `again` is lower than for `hard`, `hard` lower than `good`, and `good`
      lower than `easy`.
- [ ] AC-3 · Given a task in `review`, when `good` is applied, then the new
      interval is strictly longer than the previous one.
- [ ] AC-4 · Given a task, when retrievability is computed at its due date, then
      it equals the configured target retention within 0.02.
- [ ] AC-5 · While a task is `suspended`, applying any grade shall leave its
      state and due date unchanged and report the transition as illegal.
- [ ] AC-6 · Given a task in `review`, when `again` is applied, then the state is
      `relearning` and difficulty has not decreased.
- [ ] AC-7 · When target retention is raised, the interval produced for the same
      history and grade shall be shorter.
- [ ] AC-8 · Given a projection for all four grades, when the learner then
      answers, then the resulting due date equals the projection for that grade
      exactly.
- [ ] AC-9 · Given a review log, when the state is recomputed from scratch, then
      it equals the state built by applying the reviews one at a time.
- [ ] AC-10 · Given two tasks of the same word due within the sibling gap, when
      the session is planned, then the second is pushed beyond the gap and its
      word is not asked twice in one session.
- [ ] AC-11 · Given any sequence of legal calls, no task shall ever hold two
      states at once, and no reviewed task shall lack a due date unless
      `suspended` or `retired`.

## Check

`npm test -- scheduler`

## Open

- **⚠ SPEC GAP: the sibling gap is undecided.** AC-10 assumes a minimum interval
  between two tasks of one word; the value and whether it is fixed or
  proportional to stability are open. Inherited from
  [ADR-0004](../../adr/0004-word-task-data-model.md).
- **⚠ SPEC GAP: the lapse threshold for `suspended` is undecided** — see
  UC-013, which owns the repair behavior but not the number.
- Whether per-user weight optimisation happens here or in a separate module.
  Deferred: the default weights are more accurate than SM-2 without it
  ([`../../studie/04-karteikarten-srs.md`](../../studie/04-karteikarten-srs.md)).
