# UC-022 — Understand a rule at the moment I get it wrong

<!-- id: UC-022 -->
<!-- specs: SPEC-service-form-cell-explanation, SPEC-component-form-error-explanation -->

**Who:** a learner who has just made the same mistake for the fourth time.
**Wants to:** know the rule, briefly, right now.
**So that:** they stop guessing from patterns and start knowing — without having
to read a grammar chapter first.

Derived from [`../study/STUDY-002-evidence.md`](../study/STUDY-002-evidence.md) E5,
[`../study/STUDY-001-duolingo.md`](../study/STUDY-001-duolingo.md) D3, and
[`../study/STUDY-009-antipatterns.md`](../study/STUDY-009-antipatterns.md) A8.

## Today

Two failures, opposite in shape. Gamified apps teach grammar implicitly, by
exposure, and give almost no explanation — even though explicit instruction is
consistently the better-evidenced approach. Course apps put the explanation
first, as a chapter, where nobody reads it because no question has been raised
yet.

## Success looks like

- When an answer is wrong, the learner can get a **short** explanation of the
  specific rule involved, without leaving the session.
- **v1 ships on form-recall cards** — self-graded recall with on-demand and
  post-**Again**/**Hard** disclosure ([`form-cell-explanation.md`](../specs/service/form-cell-explanation.md));
  typed production and meaning-recall follow in later slices.
- The explanation is one screen, with examples, and names the contrast that
  caused the error rather than the whole topic.
- It is **on demand**. Nothing forces the learner through it, and continuing
  without reading it is a normal choice.
- Repeated errors of the same kind surface the explanation more prominently, and
  offer targeted practice (a minimal-pair card, a form drill) rather than more
  of the same exercise.
- The full explanation remains findable later, for learners who do want to read
  ahead — available, but never in the way.
- Explanations are in the learner's own language at lower levels, and can switch
  to the target language when that is realistic.

## Out of scope

A complete reference grammar, linguistic terminology as a subject, and any
requirement to complete a grammar unit before practising.
