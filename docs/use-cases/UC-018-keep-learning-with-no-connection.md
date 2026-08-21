# UC-018 — Keep learning with no connection

<!-- id: UC-018 -->
<!-- specs: SPEC-service-review-write-queue -->

**Who:** anyone on a train, a plane, an underground line, or a bad data plan.
**Wants to:** do their session anyway.
**So that:** the most reliable block of learning time in a normal week — the
commute — does not depend on signal.

Derived from [`../backlog/BL-009-feature-catalogue.md`](../backlog/BL-009-feature-catalogue.md)
F82, and the listening scenario in
[`../study/STUDY-005-input-reading-listening.md`](../study/STUDY-005-input-reading-listening.md).

## Today

Most learning apps degrade to nothing offline, which removes exactly the
situation they were designed for. Worse, some lose the session: answers given
underground vanish on resurfacing.

## Success looks like

- A normal card session runs fully offline: scheduling, grading, and the "why
  this card now" explanation (UC-005) all work without a request.
- Audio the learner has opened recently, and their downloaded content, plays
  offline with its transcript.
- Answers given offline are **never lost**. They sync when possible, and the
  learner is not asked to think about it.
- If two devices were used offline, the histories merge without duplicating
  reviews or double-counting a word.
- Features that genuinely need a connection — generated text, the conversation
  partner — say so plainly instead of failing silently or hanging.
- The learner can see what is available offline before they lose signal, not
  after.

## Out of scope

Offline generation of new content, offline speech recognition beyond the fixed
command list, and full multi-device conflict resolution beyond review history.
