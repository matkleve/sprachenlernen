# UC-078 — Practise forms without mixing in meanings

<!-- id: UC-078 -->
<!-- specs: SPEC-page-words-review, SPEC-service-session-builder, SPEC-service-form-mastery-signal -->

**Who:** a learner whose vocabulary is ahead of their inflection — they know what
*hablar* means but keep missing *hablo* when meanings and forms are shuffled
together.
**Wants to:** start a review session that practises **forms only**, without a
grammar course or choosing a different "mode" on every visit to Words.
**So that:** Steigerungen get deliberate practice instead of being drowned out by
meaning-recall cards.

Derived from owner UX review 2026-08-19 (revised 2026-08-20), [`UC-041`](UC-041-know-the-forms-not-just-the-words.md),
and [`UC-063`](UC-063-get-to-my-cards-without-the-menu.md). **Not** a fourth
bottom tab — [`ADR-0009`](../adr/0009-three-destinations.md) stands.

## Today

Form-recall Tasks exist in the SRS pool and appear in the default mixed session
when staging allows ([`session-sampling.md`](../specs/service/session-sampling.md)).
`/words` offers one **Start review** action (mixed deck). Form-only entry is not
a second control on Words — it lives on Progress and Methods.

## Success looks like

- `/words` **Start review** opens `deck=mixed` — one flashcard stack; form-recall
  cards use the same flip-and-grade UI as meaning-recall
  ([`review-session.md`](../specs/feature/review-session.md)).
- **Form-only** sessions (`/words/review?method=srs-session&deck=form`) are
  reachable from **Progress** weak-pattern links ([UC-062](UC-062-see-what-is-holding-my-level-back.md),
  [`form-mastery-signal.md`](../specs/service/form-mastery-signal.md)) and from
  hosted **Methods** on `/methods` — not from a second card or icon on Words.
- `deck=form` restricts the queue to form-recall Tasks that pass staging
  ([`form-recall-pool.md`](../specs/service/form-recall-pool.md)).
- When inflection applies, `/words` shows a collapsed **paradigm cell** callout
  under Start review (what a form card is asking for) — not a separate Forms
  section card.
- Languages with little or no inflection in the profile omit the callout
  entirely (same rule as UC-041).

## Out of scope

A **Forms** destination in the bottom nav; a backlog or due counter; a grammar
curriculum; **`deck=meaning`** or **`deck=form`** pickers on `/words`; typed /
build / spoken answer-route tabs on review cards (those belong on Methods when
built); the full paradigm-cell engine ([`form-practice.md`](../specs/service/form-practice.md) —
T-W6).
