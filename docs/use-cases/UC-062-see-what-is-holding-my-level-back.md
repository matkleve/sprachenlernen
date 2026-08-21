# UC-062 — See what is actually holding my level back

<!-- id: UC-062 -->
<!-- specs: SPEC-service-form-mastery-signal -->

**Who:** a learner whose overall level has not moved and who wants to know which
part of their language is responsible.
**Wants to:** open the number and follow it down to the thing that is limiting
it.
**So that:** a level becomes a diagnosis they can act on instead of a verdict
they have to accept.

Derived from [`../study/STUDY-003-level-model.md`](../study/STUDY-003-level-model.md), honesty
rule 3 ("every number opens — a competence figure without a derivation is an
oracle") and the overall-level formula. Extends UC-004 one layer deeper: UC-004
opens a level into its **skills**; this opens a skill into its **signals**, and a
signal into the cells or ranks underneath.

## Today

A single level, or four, with no derivation. The learner cannot tell whether
their B1 is held down by vocabulary, by forms, by never having spoken, or by the
formula. So the only available responses are to trust it or to dismiss it.

## Success looks like

- The overall level names which skill is binding it, which the formula already
  determines: the overall level is the second-lowest of the counting skills, so
  there is a specific skill to name and naming it invents nothing.
- Each skill opens into the layer-1 signals that produced it, each with its
  value, its uncertainty and its status.
- A signal opens into what it is made of — for form mastery, which cells or cell
  groups are stable and which are not.
- Every statement runs in the direction **"this is low because of that"**, never
  **"do that to get this"**. The app may say "your writing is what holds B1.2
  down, and form mastery is its weakest signal". It may never say "raise your
  plurals to reach A2".
- Signals are shown as **values and statuses, never as levels**. Only skills have
  levels. A signal rendered as "Plurals: A2" has invented a level the model does
  not define.
- The four statuses survive down to signal granularity: measured · uncertain ·
  **not measured** · not in profile. A signal with no data reads "not measured"
  with the route beside it, and never renders as an empty bar, a zero, or a dash.
- A signal that fell says so, with the cause where the cause is known, and
  without the tokens reserved for errors and destructive actions — a fall is
  neither.
- Absences are stated once at the level where they are true, not repeated per row.

## Out of scope

Any claim that a specific sub-metric is required for a CEFR band — no published
mapping in this repository is specific enough to support one, and the vocabulary
anchors are explicitly a calibration starting point, not truth. Also out: a grid
of progress bars, comparison against other learners (UC-004), and setting a
target value on a signal.

## Undecided

- ~~**⚠ SPEC GAP: form-mastery display granularity**~~ **Answered 2026-08-19
  (owner UX review):** per **cell group** on Progress drill-down (T-W5) —
  e.g. *-ar present*, *noun plural* — with a link to `deck=form` filtered
  practice when a group is weak. Per-cell detail stays inside form practice
  (T-W6), not on the Progress summary row.
- **⚠ SPEC GAP: no dated signal → band mapping exists per language.** The
  authoritative inventories that enumerate this (PCIC for Spanish, the *Profilo*
  for Italian) are licensing-constrained, so they can calibrate our bands but
  cannot be republished as requirements.
