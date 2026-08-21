# UC-004 — Know where I stand, and whether I am getting better

<!-- id: UC-004 -->
<!-- specs: SPEC-page-progress, SPEC-service-dose-band, SPEC-component-reflection-deck, SPEC-feature-weekly-reflection -->

**Who:** someone learning a language on their own, weeks or months in.
**Wants to:** see their current level and whether it moved.
**So that:** they can tell whether the time they are spending is working — and
where it is not.

Derived from [`../study/STUDY-003-level-model.md`](../study/STUDY-003-level-model.md).

## Today

Apps show XP, streaks and course position. None of those answer the question.
The learner's actual method is to periodically try something real — a film, a
conversation, a news article — and guess from how badly it went. That works, but
it is rare, discouraging, and gives no direction.

## Success looks like

- The home surface shows a level per skill (reading, listening, speaking,
  writing) as a CEFR sub-level, and one overall level.
- Next to it, one sentence naming the weakest skill and what would move it.
- A trend over 30 / 90 / 365 days, where the primary figure is the **change**,
  not the standing.
- With too little data, the display says so — a range and "few data yet", never
  a precise-looking number.
- Every number can be opened to show which measured signals produced it.
- Once a week, a short **reflection deck** — one to five swipeable cards, each
  with a personal sentence and the chart behind it ([`weekly-reflection`](../specs/feature/weekly-reflection.md)).
- Each skill carries one of four statuses — measured, uncertain, not measured,
  not in profile — defined in
  [`../study/STUDY-003-level-model.md`](../study/STUDY-003-level-model.md) and nowhere
  else. A skill is **never guessed** to fill a gap.
- The last two statuses are excluded from the overall level rather than scored
  low, so a learner who cannot or does not use a skill is not penalised for it
  (UC-010, UC-020).
- The overall level states which skills it was computed from.
- The level can go **down** after a long pause, and says what would bring it
  back.

## Out of scope

Comparison against other learners (deliberately deferred — see
[`../study/STUDY-003-level-model.md`](../study/STUDY-003-level-model.md), V4), certificates,
exam preparation, and any placement test taken before the first exercise.
