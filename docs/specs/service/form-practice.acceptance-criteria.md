# Form practice — acceptance criteria

<!-- parent: SPEC-service-form-practice -->

Nothing here is implemented. These are written now so the build has a target and
so the negative ones exist before someone helpfully adds what they forbid.

## Items and introduction

- [ ] Given the shipped pool, when cells are instantiated, then a cell becomes a
      Task only after the learner meets or fails that form — never in bulk.
- [ ] Given a day's session, then no more than the configured cap of **new**
      cells is introduced, whatever the due set looks like.
- [ ] Given the introduction order, then it is derived from form frequency
      stratified by cell class, and the subjunctive sorts last.
- [ ] Given a cell that has not been introduced, when the learner asks for it,
      meets it in a text, or fails it in production, then it is available
      immediately — weight, never a lock.

## Session composition

- [ ] Given a built session, then no two consecutive items share a lemma.
- [ ] Given any four consecutive items, then at most two share tense ×
      conjugation class.
- [ ] Given an answered cell whose confusable twin is in the pool, then the twin
      appears 2–5 items later.
- [ ] Given a due set that cannot satisfy the three rules above, then non-due
      cells are pulled forward rather than a blocked run being shipped.
- [ ] Given a session heading, then it names the **scope** and never the answer
      — and no heading appears above contextual items whose answer it would
      pre-solve.

## Answering

- [ ] Given any item, then it can be answered by typing, by building from
      endings, or aloud — and all three count equally toward the same Task.
- [ ] Given the build route, then the ending chips span every class and tense in
      play, not the four endings of the item's own paradigm.
- [ ] Given the typed route, then autocorrect and autocapitalise are off, an
      accent strip is present without requiring long-press, and the stem is not
      prefilled.
- [ ] Given the spoken route, then three grades are offered, not four.
- [ ] Given an answer that differs from the expected form **only** by an accent,
      then it is accepted **unless** the unaccented string is itself a form of
      the same lemma, in which case it is wrong and the difference is named.
- [ ] Given a cell with several accepted forms, then every accepted form is
      marked correct and the others are shown with their variety label.

## Negative — the things that will be asked for

- [ ] **No conjugation grid whose cells fill in and stay filled.** Every filled
      cell is a count that can only rise, it is blocked by construction, and it
      claims permanence about a memory model that decays.
- [ ] **No "cells mastered: 128 / 1,240".** The denominator is undefined while
      paradigm completeness is partial, and the numerator only rises.
- [ ] **No ✓/✗ on a spoken answer**, and no pronunciation score on a form.
- [ ] **No "verb of the day — all six forms"** as a recurring item: blocked
      practice on a daily cadence, which is also a streak wearing a costume.
- [ ] **No timed drill, no speed record.** Response time is a signal; it is
      measured and never displayed as a race.
- [ ] **No lock, no "unlock the subjunctive"**, no prerequisite chain.
- [ ] **No form generated from a regular pattern** to fill a gap in the shipped
      table — it fails precisely on the frequent irregular verbs where form
      mastery matters most.
- [ ] **No marking a regional variety wrong.** 28.2 % of cells have more than one
      correct form; rejecting one is the app scoring its own settings.

## Check

`npm test -- form-practice`
