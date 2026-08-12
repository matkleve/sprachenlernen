# Scheduler

<!-- id: SPEC-service-scheduler -->
<!-- use-case: UC-005 -->
<!-- status: active -->

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
| 5 | A task whose consecutive lapses reach the threshold | state `suspended`; its last due date is **retained but ignored** |
| 6 | A full review log | the same state as replaying the reviews one at a time |
| 7 | Two tasks of one word, both due for the same session | session builder includes **at most one** — see [`session-builder.md`](session-builder.md) |

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
| `suspended` | consecutive lapses reach the threshold, **or** the learner suspends it | never scheduled; state frozen; due date retained | no — reversible only via `unsuspend`, which returns it as `learning` (UC-013) |
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

**A grade never moves a task across the machine.** `relearning` means "lapsed
from `review`" — a task still in `learning` that fails stays in `learning`, and a
success promotes only forwards. Deriving the next state from stability alone
produced targets this map forbids, and the resulting illegal move discarded the
learner's answer outright.

**Scheduling is excluded by state, never by date.** A suspended task keeps its
last due date, which may be in the past. Any consumer selecting work must filter
on state; filtering on `due <= now` alone will schedule suspended tasks.

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
migration ([`../../study/03-level-model.md`](../../study/03-level-model.md),
rule 4) — and it is the property AC-9 checks.

### Config thresholds (owned by `DEFAULT_CONFIG`)

| Field | Default | Used for |
| --- | --- | --- |
| `graduationStability` | 1 day | Scheduler: `learning` → `review` |
| `heldStabilityThreshold` | 7 days | Vocabulary counts, form-recall staging (`isTaskHeld`) |
| `matureStabilityThreshold` | 21 days | Atlas `mature` tier on held tasks |

Graduation and held answer different questions. Changing held thresholds is a
**calibration event** — counts move without any new reviews (2026-08-12).

## Acceptance criteria

Seventeen, in [`scheduler.acceptance-criteria.md`](scheduler.acceptance-criteria.md).
AC-12 to AC-17 were added after the adversarial review of 2026-08-08 — each one
exists because a real defect got past a green test suite.

## Check

`npm test -- scheduler`

## Open

- Out-of-order reviews (a timestamp before the previous one) are accepted and
  treated as zero elapsed time. No rule forbids backdated corrections, but
  combined with AC-17 a backdated entry freezes stability growth. **⚠ SPEC GAP:
  whether the log must be monotonic in time.**
- ~~**⚠ SPEC GAP: the sibling gap**~~ **Resolved 2026-08-12.** Spacing is
  FSRS-first: each Task has its own `due` date from memory strength — no fixed
  calendar override. **Within one session:** the session builder includes at
  most **one Task per Word**; a second sibling (e.g. meaning-recall and
  form-recall for *hablar*) stays due for the **next** session. **Within-session
  requeue** ([UC-071](../../use-cases/UC-071-get-a-wrong-card-back-before-the-session-ends.md))
  repeats the **same** Task after `again`/`hard` — that is short-term rehearsal,
  not sibling spacing. Full form-practice mixing rules live in
  [`form-practice.md`](form-practice.md).
- **⚠ SPEC GAP: the lapse threshold for `suspended` is undecided** — see
  UC-013, which owns the repair behavior but not the number.
- Whether per-user weight optimisation happens here or in a separate module.
  Deferred: the default weights are more accurate than SM-2 without it
  ([`../../study/04-flashcards-srs.md`](../../study/04-flashcards-srs.md)).
