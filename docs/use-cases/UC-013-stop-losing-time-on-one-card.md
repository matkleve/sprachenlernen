# UC-013 — Stop losing time on the card I keep failing

<!-- id: UC-013 -->
<!-- specs: SPEC-service-broken-card-detection -->

**Who:** anyone a few months into spaced repetition.
**Wants to:** be rid of the handful of cards that fail every single time.
**So that:** a small number of bad cards stops eating a large share of their
practice — and stops feeling like a personal failing.

Derived from [`../study/04-flashcards-srs.md`](../study/04-flashcards-srs.md),
"Die Leech-Falle".

## Today

The scheduler answers repeated failure with more repetition, which is the one
thing that does not work. Almost always the **card** is broken — five meanings
on one card, no context, or a neighbour word it is being confused with — but
nothing in the app says so, so the learner concludes they are bad at languages.

## Success looks like

- A card that keeps failing is **suspended automatically** after a stated number
  of failures. It stops appearing; it does not silently keep costing time.
- The learner is told what the app thinks is wrong, specifically: confusion with
  a named other word, too many meanings, no context, or a sound contrast they
  cannot hear yet (UC-014).
- Each diagnosis offers a **repair**, not a retry: a minimal-pair card against
  the word being confused with, a split into separate cards, a sentence for
  context, or perception training.
- Suspension is visible and reversible, and the card's history survives it.
- A repaired card re-enters as new, not with its old failure record held against
  it.
- Nowhere does the app suggest the learner should simply try harder.

## Out of scope

Manual editing of scheduler parameters, and deleting cards in bulk.

## Undecided

- **Resolved 2026-08-12 (decision 12):** same-session repeats do **not**
  count toward the cross-session failure count that triggers suspension here.
  UC-071's within-run buffer and this use case's leech suspend are separate
  mechanisms. A card can be rehearsed heavily in one sitting without being
  suspended that same day; suspension still requires repeated failure **across
  sessions**.
