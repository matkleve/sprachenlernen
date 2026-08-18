# Review write queue — instant grades, durable sync

<!-- id: SPEC-service-review-write-queue -->
<!-- use-case: UC-018 -->
<!-- status: active -->

When a learner taps a grade, the app must **not** wait on the network. The grade
is recorded **locally first**, the next card appears immediately, and the server
write runs in the background. This is what [ADR-0005](../../adr/0005-local-first-review-log-with-accounts-as-an-addition.md)
specified and what [UC-018](../../use-cases/UC-018-keep-learning-with-no-connection.md)
needs for commute practice.

**Coder + UX agreed principle:** the card session is a rhythm game — any
full-screen wait breaks flow. Persistence is bookkeeping; it must never sit on
the critical path.

## Scope

- **In:** a browser-local append-only queue in `lib/db/review-write-queue.ts`
  (IndexedDB), flush to [`review-log.md`](review-log.md) via the existing
  adapter, retry with backoff, idempotent client `review_id` per row, and
  wiring in `useReviewSession` so grading never blocks the FSM.
- **Out:** multi-device merge (T-B9 / ADR-0011 Option B tiebreak); export/delete
  (UC-024); showing a due count; rewriting the scheduler.

Parent contracts: [`review-session.md`](../feature/review-session.md),
[`review-log.md`](review-log.md).

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Taps a grade | Row appended to the local queue with a new `review_id`; session advances to the next card **immediately** — no disabled buttons, no "Saving…" on the card |
| 2 | Flush succeeds | Row removed from the queue silently |
| 3 | Flush fails (offline, 5xx, auth) | Row stays in the local queue; **nothing** appears during the card run — flush retries on a timer, when the tab regains focus, and when connectivity returns |
| 4 | Closes the tab with pending rows | Queue survives in IndexedDB; flush resumes on next visit |
| 5 | Session ends with pending rows | Summary may show one muted background-save line — not an error |

### Status surface (UX)

- **During an active card run:** nothing — success and failure are both silent.
  The learner keeps grading; rows live in IndexedDB until the server confirms.
- **On session complete only:** if rows are still queued, one muted line on the
  summary — e.g. "We'll save your reviews in the background." — not red, not a
  modal, not on the card.
- **No error copy** (`Your grade could not be saved`) on the review surface —
  the queue retries automatically; the learner does not need to act.

## States

Queue row:

| State | Meaning |
| --- | --- |
| `pending` | waiting to flush |
| `flushing` | in flight to server |
| `done` | removed after confirmed append |
| `failed` | kept; retry eligible |

Session FSM no longer exposes a learner-visible `persisting` phase — see
[`review-session.states.md`](../feature/review-session.states.md).

## Data

Each queued row carries everything `appendReview` needs today, plus:

| Field | Notes |
| --- | --- |
| `review_id` | client UUID — idempotency key on insert |
| `queued_at` | when the learner tapped |
| `attempts` | retry count |

`installation_id` and `user_id` are filled at flush time (session may have
refreshed).

## Implementation phases

| Phase | What ships | What it fixes |
| --- | --- | --- |
| **A — optimistic advance** | in-memory queue + async flush; survives the session but not tab kill | removes "Saving…" and blocked buttons |
| **B — durable queue** | IndexedDB backing (this spec's target) | UC-018 offline; survives tab close |

Phase A is acceptable as a first merge only if Phase B is tracked immediately
after — otherwise grades are lost on tab close, which violates UC-018's "never
lost" rule.

## Acceptance criteria

See [review-write-queue.acceptance-criteria.md](review-write-queue.acceptance-criteria.md).

## Check

`npm test -- review-write-queue review-session session-machine review-log`

## Open questions

**⚠ SPEC GAP: duplicate `review_id` on server.** Closed by migration
`20260810120000_review_log_review_id.sql` — unique per `user_id`.
