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
| 2 | Sees a card | Front (Spanish lemma) only; four grade buttons; progress `n of 15` with **no due count** (UC-063) |
| 3 | Taps a grade | Phase → `persisting`; `appendReviewAction` writes one row; on success → `revealed` (back shown) |
| 4 | After reveal | Phase → `advancing` → next card `prompting`, or `complete` when the queue ends |
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
- [ ] Given card 1, when the learner taps **Good**, then the back appears, a row
      is appended for that card's `taskId`, and card 2 front appears with **no
      text from card 1** anywhere in the output.
- [ ] Given the last card graded successfully, when persistence completes, then
      phase is `complete` and grade buttons are not rendered.
- [ ] Given a persistence error, when the learner taps a grade, then the same
      card stays active, grades re-enable, and error copy is shown.
- [ ] Given any phase, then no due count, backlog figure or badge appears.

## Open questions

**⚠ SPEC GAP: the learner grades before seeing the back, and the back is then
shown for 400 ms.** Behavior rows 3–4 fix that order and the implementation
follows it; the 400 ms is in `useReviewSession` and in no record at all. Two
things are undecided and neither can be settled here:

1. **Whether grading precedes the reveal.** Every other SRS reveals first and
   grades second, because a grade is a report about a recall the learner has
   just *checked*. As specced, the learner reports on an unverified memory and
   then watches the answer go past — so `again`/`good` cannot mean "I was
   wrong"/"I was right", which is what FSRS reads them as. This is the product's
   own standard applied to itself (`study/25-…`): the grade is a measurement the
   app is not currently in a position to make.
2. **How long the back stays, if the order is kept.** 400 ms is not long enough
   to read a gloss, and any number chosen here is a decision nobody has made.
   A learner-driven "next" would remove the constant rather than tune it.

Until this is answered the constant stays where it is, named here so it is not
mistaken for a considered value.

## Check

`npm test -- review-session session-machine`
