# Review session

<!-- id: SPEC-feature-review-session -->
<!-- use-case: UC-011 -->
<!-- use-case: UC-071 -->
<!-- status: active -->

The multi-card SRS runner: a fixed-length queue, one card at a time (meaning-
recall or form-recall), grades that append to the review log (T-B2).
**Sensitive** — stateful UI with persistence.

## Scope

- **In:** `features/review-session/` — session FSM
  ([`review-session.states.md`](review-session.states.md)), `useReviewSession`,
  `ReviewSession`, `ReviewCard`, `SessionComplete`, server action to load the
  queue (`buildSessionAction`), and wiring on `/words/review` for
  `method=srs-session`. Replaces `ReviewOpen`.
- **Out:** scheduler projection UI (UC-005 G1–G4); session-length picker;
  sibling spacing; non-`srs-session` methods; Words atlas and horizon (T-B3).
  Persistence blocking the UI — see
  [`../service/review-write-queue.md`](../service/review-write-queue.md).

**Reuse: `Button`** for grade controls.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Lands on `/words/review?method=srs-session` | Session prepares: server returns a 15-card queue from the starter deck + their review history |
| 2 | Sees a meaning-recall card | Front (target-language lemma) only; language name on the card; tap the card to flip and see the meaning |
| 2b | Sees a form-recall card | Front (English gloss + produce prompt) only; same flip interaction; back shows the target surface form |
| 3 | Taps the card | Back shown; four grade buttons tinted **Again** (light red), **Hard** (light yellow), **Good** (light green), **Easy** (lighter green); grade prompt differs by task type |
| 4 | Taps a grade | Grade queued locally; **next card immediately** (`advancing` → `prompting` or `complete`); server flush runs in the background ([`review-write-queue`](../service/review-write-queue.md)). **`again`** re-inserts the card five positions ahead (or at end if fewer than five remain); **`hard`** re-inserts at end of the remaining queue; **`good`** / **`easy`** do not requeue ([ADR-0012](../../adr/0012-ux-decisions-requeue-i18n-leech-nav.md), UC-071) |
| 5 | Background flush fails | Session does not rewind; non-blocking status with Retry |
| 6 | Session `complete` | Summary: cards graded this session; link back to Words and Methods |
| 7 | Viewport &lt; `md` during an active card | Method name and progress share one line; card and grade row fit without page scroll |
| 8 | Taps **Report** on a card | Card is flagged for this learner and spoken language; confirmation shown; card stays in the current queue ([`broken-card-detection`](../service/broken-card-detection.md), UC-023) |

## States

See [`review-session.states.md`](review-session.states.md). Loading, error and
empty queue are mutually exclusive owners:

| Condition | Owner | Effect |
| --- | --- | --- |
| Queue loading | `preparing` | No card, no grades |
| Queue build failed | error surface | Message + link back; no FSM |
| Empty queue | `complete` immediately | "Nothing to review" copy |

## Data

Reads the built session queue (server), `installationId` (client), the local
write queue (client). Writes via
[`review-write-queue`](../service/review-write-queue.md) — not a blocking server
round trip per card.

## Acceptance criteria

- [ ] Given a signed-in learner opening `srs-session`, when the session loads,
      then 15 cards present in frequency order (no prior history) and card 1
      shows front only with grades enabled.
- [ ] Given card 1, when the learner taps the card then **Good**, then the back was visible before grading, a row
      is appended for that card's `taskId`, and card 2 front appears with **no
      text from card 1** anywhere in the output.
- [ ] Given the last card graded successfully, when persistence completes, then
      phase is `complete` and grade buttons are not rendered.
- [ ] Given card 1, when the learner taps the card then **Good**, then card 2
      front appears **before** the server confirms the write.
- [ ] Given a background flush failure after advancing, when the learner is on a
      later card, then a retry status appears and the session does not rewind.
- [ ] Given any phase, then no due count, backlog figure or badge appears.
- [ ] Given card 1 of a two-card session, when the learner grades **Again**, then
      card 2 appears next and card 1 returns after card 2 is graded (requeue at
      end when the queue is shorter than five cards ahead).

## Open questions

None — flip-then-grade matches standard SRS apps and FSRS semantics (the learner
checks recall before reporting).

## Check

`npm test -- review-session session-machine review-session-requeue`
