# UC-006 — Come back after two weeks away without drowning

<!-- id: UC-006 -->
<!-- specs: SPEC-feature-review-horizon, SPEC-feature-words-home, SPEC-service-session-builder, SPEC-service-vocabulary-snapshot, SPEC-page-words -->

**Who:** someone who was ill, travelling, or simply busy.
**Wants to:** resume learning.
**So that:** the break costs them a few days of catching up, not the habit.

Derived from [`../study/STUDY-004-flashcards-srs.md`](../study/STUDY-004-flashcards-srs.md)
("Die Rückstandsfalle") and
[`../study/STUDY-008-motivation.md`](../study/STUDY-008-motivation.md).

## Today

The app greets them with a backlog counter in the hundreds and, in gamified
apps, with a broken streak and an offer to buy it back. This is the single most
common point at which people delete a spaced-repetition app. The data behind the
number is fine; the number is the problem.

## Success looks like

- Opening the app after a gap shows a **session of the usual length**, not a
  backlog.
- One sentence states what happened and what the plan is: which cards come
  first, and over how many days the rest is absorbed.
- The review horizon on `/words` **opens expanded** after a gap (≥ 7 days
  without a session) with week columns and, when detectable, a causal peak
  sentence — not a shame counter (UC-005).
- No overdue count appears as a primary figure anywhere. Overdue work is
  absorbed by the session; the forecast shows **future** scheduled bins only.
- Overdue cards are prioritised by urgency and frequency, so the most valuable
  words are recovered first.
- Nothing is lost, and the app says so.
- A planned break can be declared in advance: no notifications during it, no
  penalty after it.
- Any streak-like figure survives an interruption by design, and losing one is
  never accompanied by a purchase offer.

## Out of scope

Re-testing the user's level on return (that follows from normal use — UC-004),
and the review algorithm itself.
