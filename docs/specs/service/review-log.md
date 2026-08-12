# Review log persistence

<!-- id: SPEC-service-review-log -->
<!-- use-case: UC-005 -->
<!-- also-serves: UC-024 -->
<!-- status: active -->

T-B2. Append-only storage for each answered Task — grade, latency, timestamp,
installation, and owner — behind `lib/db/review-log.ts` (ADR-0005, ADR-0006,
ADR-0007). **Sensitive** (`AGENTS.md`).

## Scope

- **In:** the `public.review_log` payload columns (migration appended after
  T-B8's ownership migration), `lib/db/review-log.ts` (`appendReview`,
  `listReviewsForTaskIds`, `toSchedulerReview`), `lib/installation-id.ts`
  (browser-local installation UUID), `features/review-session/actions.ts`, and
  wiring `ReviewSession` in `features/review-session/` so each graded card
  appends one row. **Read paths for scheduling surfaces move to
  [`task-state.md`](task-state.md)** once shipped — this module remains the
  append-only audit trail and export source. Ownership and RLS remain in
  [`auth.md`](auth.md).
- **Out:** the session queue builder ([`session-builder.md`](session-builder.md));
  real Word/Task
  tables; scheduler projection UI; export/delete (UC-024). Offline durability
  moves to [`review-write-queue.md`](review-write-queue.md) (draft). **⚠ SPEC GAP:**
  share a timestamp from different installations — deferred to T-B9 (ADR-0005).
  **Dormant, not closed** ([ADR-0011](../../adr/0011-the-review-log-shipped-server-only.md)):
  the log shipped server-only, so there is one authority and nothing to merge.
  The gap binds again the moment anything writes locally.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Taps a grade on a review session card | `latency_ms` is measured client-side; `appendReview` writes one row with the signed-in Account's `user_id`, the browser's `installation_id`, the card's `task_id`, grade, and `reviewed_at` |
| 2 | Taps a grade while unsigned-in | Server action returns an error outcome; no row is written |
| 3 | Session queue is built | `listReviewsForTaskIds` returns every stored review for the deck's tasks, `reviewed_at` ascending, mapped to `{ at, grade }` via `toSchedulerReview`. Task ids are de-duplicated, sent in batches of **100**, and the merged result re-sorted |
| 3a | Any batch fails | The whole read returns `error` — a partial history is indistinguishable from a learner who reviewed less, and the scheduler would reschedule from it |
| 4 | Signed-out read | `listReviewsForTaskIds` returns an `error` outcome — never an empty history, which the builder would read as a new learner |

## States

Not a client state machine. Persistence outcomes are a discriminated union per
`appendReview` call:

| Outcome | Trigger | Effect | Terminal? |
| --- | --- | --- | --- |
| `appended` | valid session + insert succeeds | row exists; UI confirms | yes |
| `error` | no session, validation failure, or DB error | no row; UI shows error | yes |

## Data

Builds on T-B8's `review_log` table. New columns (migration
`supabase/migrations/20260809180000_review_log_payload.sql`):

| Column | Type | Notes |
| --- | --- | --- |
| `task_id` | `text not null` | Opaque; scheduler `Task.id` |
| `grade` | `text not null` | Check: `again \| hard \| good \| easy` |
| `reviewed_at` | `timestamptz not null` | Client-provided answer time (untrusted) |
| `latency_ms` | `integer not null` | Card shown → grade tapped; `>= 0` |

`created_at` remains server default (insert time). `reviewed_at` maps to
scheduler `Review.at` as epoch ms on read. FSRS ignores `latency_ms`; UC-024
export needs it later.

**Installation id** (`lib/installation-id.ts`): random UUID in `localStorage`,
key `sl-installation-id`, generated once per browser profile — not a device
fingerprint (ADR-0005).

## Acceptance criteria

- [ ] Given a signed-in Account, when `appendReview` is called with a valid
      payload, then a row exists with that Account's `user_id`, the supplied
      `installation_id`, `task_id`, `grade`, `reviewed_at`, and `latency_ms`.
- [ ] Given rows for a set of `task_id`s, when `listReviewsForTaskIds` runs,
      then results are ordered by `reviewed_at` ascending and `toSchedulerReview`
      yields matching `{ at, grade }`.
- [ ] Given the whole 2000-lemma pool, when `listReviewsForTaskIds` runs, then it
      issues more than one request, none carrying more than 100 task ids, and
      the union covers every id in order. PostgREST puts `in.(…)` in the query
      string, so an unbatched pool read is a ~19 KB request line and a 414.
- [ ] Given rows spread across batches, when they merge, then the returned list
      is sorted by `reviewed_at` across batch boundaries, not merely within one.
- [ ] Given one batch returning an error, then the outcome is `error` and no
      partial history is returned.
- [ ] Given a task id repeated across a batch boundary, then its rows are
      returned once — a single `in.(…)` collapsed duplicates for free, and
      `rebuild` replaying a doubled history derives a stability nobody earned.
- [ ] Given an empty list of task ids, when `listReviewsForTaskIds` runs, then
      it returns no reviews without querying the database.
- [ ] Given no session, when `listReviewsForTaskIds` runs, then status is
      `error` — not an empty history.
- [ ] Given Account B signed in, when B selects from `review_log`, then zero
      of Account A's rows appear (inherits auth spec §8).
- [ ] Given no session, when `appendReview` runs, then status is `error` and
      zero rows are written.
- [ ] Given the review session, when a signed-in learner taps a grade, then the UI
      confirms persistence or shows an error — never silent failure.
- [ ] Given any signed-in Account, when `update` or `delete` is attempted on
      `review_log`, then zero rows are affected (append-only unchanged).

## Check

`npm test -- review-log installation-id` — `lib/db/review-log.test.ts` and
`lib/installation-id.test.ts` (offline adapter). `npm test -- access-control`
proves RLS with payload columns when Supabase secrets are present.
