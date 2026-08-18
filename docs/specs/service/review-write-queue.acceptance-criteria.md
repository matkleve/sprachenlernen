# Review write queue — acceptance criteria

<!-- parent: SPEC-service-review-write-queue -->

### Happy path

- [ ] Given a signed-in learner on card 3, when they tap **Good**, then card 4
      front appears within one frame — no "Saving…", no disabled grade row.
- [ ] Given a normal connection, when the flush completes, then the row exists
      in `review_log` with the same `task_id`, `grade`, and `reviewed_at` as
      queued, and the status line is absent.

### Network and offline (UC-018)

- [ ] Given the device goes offline mid-session, when the learner keeps grading,
      then every grade is queued locally and the session continues to `complete`.
- [ ] Given pending rows and connectivity returns, when flush runs, then all rows
      reach the server without user action.
- [ ] Given the learner closes the tab with 3 pending rows, when they reopen the
      app signed in, then flush runs and all 3 rows appear in `review_log`.

### Failure and recovery

- [ ] Given a flush error (403, 500, timeout), when the learner has already
      advanced, then the session does **not** return to the graded card and no
      error appears during the card run.
- [ ] Given a failed row, when the scheduled retry runs, then flush is attempted
      again and success clears the queue silently.
- [ ] Given the same row flushed twice (retry), when both requests reach the
      server, then exactly one `review_log` row exists (`review_id` idempotency).

### Race and abuse

- [ ] Given rapid double-tap on **Good**, when both events fire, then at most one
      queue row is created for that card position in that session.
- [ ] Given unsigned-out mid-session, when flush runs, then rows stay queued and
      status explains sign-in is required — no silent drop.

### UX boundaries

- [ ] Given any grade tap, then no grade button shows a loading spinner.
- [ ] Given pending = 0, then no sync status is visible anywhere on the review
      surface.
- [ ] Given pending > 0 for < 500 ms, then no sync status yet (avoid flicker).

### Out of scope (named negatives)

- [ ] **Not required:** two browsers open on one account merging in real time
      (T-B9).
- [ ] **Not required:** method-menu filter chips showing load state — they are
      already client-side ([`ARCHITECTURE.md`](../../ARCHITECTURE.md)).
