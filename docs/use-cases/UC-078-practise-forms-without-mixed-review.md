# UC-078 — Practise forms without mixing in meanings

<!-- id: UC-078 -->
<!-- specs: SPEC-feature-words-home, SPEC-page-words-review, SPEC-service-session-builder -->

**Who:** a learner whose vocabulary is ahead of their inflection — they know what
*hablar* means but keep missing *hablo* when meanings and forms are shuffled
together.
**Wants to:** start a review session that practises **forms only**, in one tap
from Words, without a separate navigation destination or a grammar course.
**So that:** Steigerungen get deliberate practice instead of being drowned out by
meaning-recall cards.

Derived from owner UX review 2026-08-19, [`UC-041`](UC-041-know-the-forms-not-just-the-words.md),
and [`UC-063`](UC-063-get-to-my-cards-without-the-menu.md). **Not** a fourth
bottom tab — [`ADR-0009`](../adr/0009-three-destinations.md) stands; this is a
second drill-in on `/words`.

## Today

Form-recall Tasks exist in the SRS pool but share a session with meaning-recall.
The Words home has one **Review** card and copy that sends learners to mixed
`srs-session`. There is no honest entry for "today I only want conjugations."

## Success looks like

- `/words` shows a **Forms** section card (same raised shell as the vocabulary
  review card) with **Review forms** as the action — not a nav tab, not a badge
  count ([`study/10-antipatterns.md`](../study/10-antipatterns.md) A3).
- Tapping it opens `/words/review?method=srs-session&deck=form` — only
  form-recall Tasks that pass staging ([`form-recall-pool.md`](../specs/service/form-recall-pool.md)).
- The existing **Review** card remains for meanings, linking to
  `deck=meaning`; a **Review mixed** path (`deck=mixed` or omitted) stays the
  default for learners who want both.
- A collapsed disclosure on the Forms card explains what a **paradigm cell** is,
  mirroring the lemma callout on the vocabulary card.
- Weak pattern hints on the Forms card (e.g. *-ire present*) come from Progress
  signal data when available — qualitative, never a due count.
- Languages with little or no inflection in the profile omit the Forms section
  entirely (same rule as UC-041).

## Out of scope

A **Forms** destination in the bottom nav; a backlog or due counter on the Forms
card; a grammar curriculum or required lesson before form review; the full
paradigm-cell engine ([`form-practice.md`](../specs/service/form-practice.md) —
that is T-W6, not this slice).
