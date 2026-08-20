# UC-073 — Explain what is wrong with a card

<!-- id: UC-073 -->
<!-- specs: SPEC-feature-review-card-report -->

**Who:** a learner in the middle of a review session who tapped the flag on a
card that looks wrong, confusing, or not worth their time.
**Wants to:** say what kind of problem it is and add a short note — or skip
that and submit with one tap.
**So that:** the people maintaining content get a signal they can act on, and
the learner does not have to leave the session or write an email.

Parent: [UC-023](UC-023-report-something-wrong.md). UC-023 owns the outcome
(flag + stop scheduling from the next session). This use case owns the **report
moment** — the popover, optional fields, and what gets stored with the flag.

Derived from owner feedback 2026-08-16 and
[`reviews/design/DR-035-review-report-and-acknowledgement-ux.md`](../reviews/design/DR-035-review-report-and-acknowledgement-ux.md).

## Today

The review session has a flag icon that fires immediately. There is no chance
to say *what* is wrong, no category, and no free-text field. The database row
is only (`user_id`, `word_id`, `spoken_language`, `flagged_at`).

## Success looks like

- Tapping the flag opens a **popover** anchored to the control — not a full
  screen, not a modal that blocks the whole session.
- The learner can submit with **one tap** (primary action, no required fields).
- Optional **category** choices cover the common cases for a vocabulary card:
  wrong translation, wrong or missing audio, confusing wording, not relevant to
  me, other.
- Optional **free text** (short — one or two sentences) for anything the
  categories miss.
- Optional **scheduling intent** is explicit: default remains "stop showing me
  this from the next session" (UC-023). A secondary path — "just send feedback,
  keep scheduling" — is a product decision; see the study doc § Scheduling
  intent.
- Submitting closes the popover, flags the card per UC-023 rules, and hands off
  to [UC-074](UC-074-know-my-report-was-received.md) for confirmation.
- Dismissing the popover (Escape, tap outside) **does not** flag — cancel is
  safe.
- Repeat report on the same (`word_id`, `spoken_language`) stays idempotent.

## Out of scope

- Partial-field reports (wrong back but fine front) — ADR-0012 decision 11 still
  flags the whole description string.
- Moderator review-queue UI, public forums, learner-submitted replacement
  content.
- Reporting from surfaces other than the review card in v1 of this increment
  (sentences, audio clips, generated passages ship later under UC-023's broader
  wording).
- Machine triage or auto-fix from the free-text note.

## Undecided

Resolved 2026-08-16: v1 is flag-only — popover states scheduling outcome in copy;
no "keep scheduling" toggle until a feedback-only path is spec'd (study/34 §3).
