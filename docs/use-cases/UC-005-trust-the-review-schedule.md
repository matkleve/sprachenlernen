# UC-005 — Understand why a card is in front of me right now

<!-- id: UC-005 -->
<!-- specs: SPEC-service-scheduler, SPEC-service-review-log, SPEC-service-vocabulary-snapshot, SPEC-service-task-state, SPEC-feature-review-horizon, SPEC-feature-words-home, SPEC-page-words -->

**Who:** anyone using spaced repetition, from the first week onward.
**Wants to:** see what the scheduler is doing and what it will do next.
**So that:** they can trust it enough to stop second-guessing it — and grade
themselves honestly instead of gaming it.

Derived from [`../study/04-flashcards-srs.md`](../study/04-flashcards-srs.md).

## Today

Every scheduler is a black box. Anki exposes its numbers but not their meaning;
Duolingo exposes nothing. So learners invent theories ("if I press Hard it
punishes me"), grade defensively, and either over-review out of anxiety or drop
out when the queue grows.

## Success looks like

- From any card, one action reveals: when it was last seen, how it went, its
  current stability, today's recall probability, and **what each possible answer
  will do to the next interval**.
- A 30-day forecast of **scheduled** review dates (deterministic FSRS `due`
  bins — not random appearance, not retrievability as the chart), grouped in
  four week columns with discrete tiles, plus one plain sentence explaining what
  causes a peak when that is derivable (study/04 G2 causal line).
- The forecast is **collapsed by default** for learners in a daily routine; it
  expands when return-after-gap, bulk new cards, a peak week, or first week
  makes the plan worth seeing — or when the learner asks (UC-063).
- The forecast does **not** include overdue tasks in its bins and does not read
  as "everything due today"; the session builder still picks up `due <= now`
  silently.
- A weekly summary of what moved from shaky to solid, in words.
- The explanation never requires leaving the session or losing the current card.
- Nothing in these surfaces is an adjustable knob. Showing the schedule and
  letting people tune it are different things
  ([`../study/10-antipatterns.md`](../study/10-antipatterns.md), A11).

## Out of scope

Editing scheduler internals, importing from other apps, and the review session
itself — this use case is only about making the existing schedule legible.
