# Review session

<!-- id: SPEC-feature-review-session -->
<!-- use-case: UC-011 -->
<!-- status: active -->

The multi-card SRS runner: a fixed-length queue, one meaning-recall card at a
time, grades that append to the review log (T-B2). **Sensitive** — stateful UI
with persistence.

## Scope

- **In:** `features/review-session/` — session FSM
  ([`review-session.states.md`](review-session.states.md)), `useReviewSession`,
  `ReviewSession`, `ReviewCard`, `SessionComplete`, server action to load the
  queue (`buildSessionAction`), and wiring on `/words/review` for
  `method=srs-session`. Replaces `ReviewOpen`.
- **Out:** scheduler projection UI (UC-005 G1–G4); session-length picker;
  offline queue; sibling spacing; non-`srs-session` methods; Words atlas and
  horizon (T-B3).

**Reuse: `Button`** for grade controls.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Lands on `/words/review?method=srs-session` | Session prepares: server returns a 15-card queue from the starter deck + their review history |
| 2 | Sees a card | Front (target-language lemma) only; language name on the card; tap the card to flip and see the meaning |
| 3 | Taps the card | Back (meaning) shown; four grade buttons in a row matching the card width |
| 4 | Taps a grade | Phase → `persisting`; `appendReviewAction` writes one row; on success → next card `prompting`, or `complete` when the queue ends |
| 5 | Persistence fails | Stays on the same card; grades re-enable; error copy shown |
| 6 | Session `complete` | Summary: cards graded this session; link back to Words and Methods |

## States

See [`review-session.states.md`](review-session.states.md). Loading, error and
empty queue are mutually exclusive owners:

| Condition | Owner | Effect |
| --- | --- | --- |
| Queue loading | `preparing` | No card, no grades |
| Queue build failed | error surface | Message + link back; no FSM |
| Empty queue | `complete` immediately | "Nothing to review" copy |

## Data

Reads the built session queue (server), `installationId` (client),
`appendReviewAction` (client → server). Writes via review log only — no session
row in the database.

## Acceptance criteria

- [ ] Given a signed-in learner opening `srs-session`, when the session loads,
      then 15 cards present in frequency order (no prior history) and card 1
      shows front only with grades enabled.
- [ ] Given card 1, when the learner taps the card then **Good**, then the back was visible before grading, a row
      is appended for that card's `taskId`, and card 2 front appears with **no
      text from card 1** anywhere in the output.
- [ ] Given the last card graded successfully, when persistence completes, then
      phase is `complete` and grade buttons are not rendered.
- [ ] Given a persistence error, when the learner taps a grade, then the same
      card stays active, grades re-enable, and error copy is shown.
- [ ] Given any phase, then no due count, backlog figure or badge appears.

## Open questions

None — flip-then-grade matches standard SRS apps and FSRS semantics (the learner
checks recall before reporting).

## Check

`npm test -- review-session session-machine`
