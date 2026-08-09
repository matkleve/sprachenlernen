# Review log persistence

<!-- id: SPEC-service-review-log -->
<!-- use-case: UC-005 -->
<!-- status: active -->

T-B2. Append-only storage for each answered Task — grade, latency, timestamp,
installation, and owner — behind `lib/db/review-log.ts` (ADR-0005, ADR-0006,
ADR-0007). **Sensitive** (`AGENTS.md`).

## Scope

- **In:** the `public.review_log` payload columns (migration appended after
  T-B8's ownership migration), `lib/db/review-log.ts` (`appendReview`,
  `listReviewsForTask`, `toSchedulerReview`), `lib/installation-id.ts`
  (browser-local installation UUID), `features/review-session/actions.ts`, and
  wiring `ReviewOpen` in `features/review-session/` so a grade on the demo card
  appends one row. Ownership and RLS remain in [`auth.md`](auth.md).
- **Out:** the review session state machine and queue (T-B1); real Word/Task
  tables; scheduler projection UI; IndexedDB offline write path and cross-device
  sync (T-B9); export/delete (UC-024). **⚠ SPEC GAP:** tiebreak when two rows
  share a timestamp from different installations — deferred to T-B9 (ADR-0005).

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Taps a grade on the open review stub | `latency_ms` is measured client-side; `appendReview` writes one row with the signed-in Account's `user_id`, the browser's `installation_id`, demo `task_id`, grade, and `reviewed_at` |
| 2 | Taps a grade while unsigned-in | Server action returns an error outcome; no row is written |
| 3 | (Future) Scheduler rebuild | `listReviewsForTask` returns rows mapped to `{ at, grade }` via `toSchedulerReview` |

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
- [ ] Given rows for a `task_id`, when `listReviewsForTask` runs, then results
      are ordered by `reviewed_at` ascending and `toSchedulerReview` yields
      matching `{ at, grade }`.
- [ ] Given Account B signed in, when B selects from `review_log`, then zero
      of Account A's rows appear (inherits auth spec §8).
- [ ] Given no session, when `appendReview` runs, then status is `error` and
      zero rows are written.
- [ ] Given the review stub, when a signed-in learner taps a grade, then the UI
      confirms persistence or shows an error — never silent failure.
- [ ] Given any signed-in Account, when `update` or `delete` is attempted on
      `review_log`, then zero rows are affected (append-only unchanged).

## Check

`npm test -- review-log installation-id` — `lib/db/review-log.test.ts` and
`lib/installation-id.test.ts` (offline adapter). `npm test -- access-control`
proves RLS with payload columns when Supabase secrets are present.
