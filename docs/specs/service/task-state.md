# Task state (materialized scheduler)

<!-- id: SPEC-service-task-state -->
<!-- use-case: UC-005 -->
<!-- status: active -->

Per-task FSRS memory state, **updated on every grade** and **read on every
surface that today replays `review_log`**. The append-only log stays for export
and audit (ADR-0005); reads move to one row per task so page load cost is
**O(pool size)**, not **O(reviews ever)**.

**Sensitive** (`AGENTS.md`) — persisted state, migration, red-test-first.

Supplement (schema diagrams, speed model, migration): [`task-state.supplement.md`](task-state.supplement.md).

## Scope

- **In:** `public.task_state` table + RLS; `lib/db/task-state.ts`
  (`upsertFromGrade`, `listTaskStatesForTaskIds`, `listTaskStatesForUser`);
  transactional write: append `review_log` row **and** upsert `task_state` in one
  database transaction; switch read paths in
  `features/words/reading.ts`, `features/progress/reading.ts`,
  `features/method-menu/readStanding.ts`, `features/review-session/actions.ts`,
  `lib/db/language-holdings.ts` from replay to materialized state; backfill
  migration from existing `review_log`; parity test `rebuild(log) ===
  task_state` per task (scheduler AC-9).
- **Out:** deleting or stopping `review_log` appends; method-specific storage
  (gap-fill, dictation, etc. map to grades — see supplement § Method grades);
  cross-device sync merge (ADR-0011 gap); pre-aggregated vocabulary counts table
  (this spec's row-per-task read is enough for stage 1); offline queue flush
  (`review-write-queue.md` — must call the same transactional write when it ships).

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Taps a grade (Words review or any future card-engine method) | One `review_log` insert **and** one `task_state` upsert in a **single transaction**; scheduler state on the row matches `applyReview` / replay of all prior rows plus this one |
| 2 | Opens `/words`, `/progress`, `/methods` standing, or starts a review session | Loads `task_state` for the active pool's task ids — **no** `listReviewsForTaskIds` on these paths |
| 3 | Exports history (UC-024, future) | Still reads `review_log` — full append-only history unchanged |
| 4 | Opens "words I struggle with" (future filter) | Queries `task_state` where `state` in (`learning`, `relearning`) or `last_grade` in (`again`, `hard`) — no replay |
| 5 | Backfill runs on deploy | Every existing account gets `task_state` rows derived from `rebuild` over their log; empty log → no rows (tasks stay `new` in memory only until first review) |

## States

`task_state.state` mirrors scheduler `TaskState` (`docs/specs/service/scheduler.md`).
Transitions happen only inside `upsertFromGrade`, never by direct SQL from app code.

| State | Trigger | Effect | Terminal? |
| --- | --- | --- | --- |
| `new` | no row yet | not stored — absence means `newTask()` | no |
| `learning` … `retired` | grade applied | row updated; `due` drives scheduling | `retired` yes |

## Data

See supplement for **today vs future** table shapes. Owner: `user_id` + `task_id`
(unique). RLS: same pattern as `review_log` — `select`/`insert`/`update` own rows
only; no `delete` (retire = `state = retired`, log kept).

**Invariant:** for every task with ≥1 review, `task_state` row must equal
`rebuild(task_id, reviews_from_log)` at the same `weights_version`. Violation =
data bug, not a UI bug.

## Acceptance criteria

- [x] Given a signed-in learner with no prior reviews, when they grade a card,
      then one `review_log` row and one `task_state` row exist and session queue
      matches replay-from-log.
- [x] Given 10 prior reviews for a task, when a new grade is appended, then
      `task_state` matches `rebuild` over all 11 log rows — not merely the latest
      grade in isolation.
- [x] Given an account with history, when `/words` renders, then it does **not**
      call `listReviewsForTaskIds` (asserted in test via mock/spy).
- [x] Given 74k `review_log` rows for the shipped Spanish pool, when
      `listTaskStatesForTaskIds` runs, then it returns at most **3704** rows
      (2000 meaning + 1704 form) regardless of review count.
- [x] Given backfill on an account with history, when it completes, then parity
      test passes for every `task_id` that has reviews.
- [x] Given a failed `task_state` upsert mid-transaction, then **no**
      `review_log` row is committed (atomic write).
- [x] **Negative:** given Account B, when B selects `task_state`, then zero of
      Account A's rows appear (inherits auth §8).

## Open questions

**⚠ SPEC GAP: method evaluation grading.** Gap-fill / production methods are not
built yet. Supplement proposes a default mapping (`wrong` → `again`, `shaky` →
`hard`, `solid` → `good`); product must confirm per method before those surfaces
ship.

## Check

`npm test -- task-state` — parity + adapter tests. `npm test -- access-control`
with `task_state` RLS when Supabase secrets present.
