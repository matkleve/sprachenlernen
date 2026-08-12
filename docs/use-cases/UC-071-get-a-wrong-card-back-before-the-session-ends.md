# UC-071 — Get a wrong card back before the session ends

<!-- id: UC-071 -->
<!-- specs:  -->

**Who:** anyone reviewing today's session who misses or struggles with a card.
**Wants to:** see that specific card again before this session ends, not wait
for whatever future day the scheduler happens to pick.
**So that:** a miss gets corrected while it is still fresh, the way a second
attempt in the same sitting actually works for memory — instead of sitting
uncorrected until an unpredictable, distant re-appearance the learner has no
say over.

Derived from the owner's own vocabulary-app experience (self-graded requeue +
per-card run status), logged in [`../IDEAS.md`](../IDEAS.md), 2026-08-12.

## Today

Grading a card `again`/`hard` only ever changes its **cross-session** FSRS due
date — shorter for a worse grade, via `stabilityAfterLapse`
([`../specs/service/scheduler.md`](../specs/service/scheduler.md)) — but the
card itself is gone for the rest of *this* run. One look, one grade, done,
regardless of how that grade went. The only second chance is tomorrow's
session, whenever the scheduler decides that is, and the learner is never told
when (UC-006, UC-063 both forbid showing that date).

## Success looks like

- Grading a card poorly makes it **reappear later in this same session** — not
  next time, this time — giving an immediate second attempt while the miss is
  still fresh.
- The reappearance is a normal graded review, nothing new: it is written to
  the review log the same way any answer is, and it feeds the same
  cross-session schedule every other review does. A card that needed extra
  tries today ends up with a **shorter** next-day interval than one that
  didn't, because that is what the scheduler's difficulty signal already does
  with repeated `again`/`hard` grades — this use case does not change that
  math, only adds more of that same kind of review before the run ends.
- The session's advertised size does not change because of a repeat: a card
  answered twice in one run is not two items on the count the learner was
  shown at the start (UC-039 — "the count never grows while the learner is
  working through it").
- The learner is never told a repeat is coming, nor when — no "due again in 5
  cards" message. If a card comes back, it is discovered by seeing it, not by
  being informed of it (see [`../IDEAS.md`](../IDEAS.md) for the visual
  status-indicator idea this is deliberately split from).
- The run still ends. A repeat is a bounded, same-sitting second attempt, not
  a mechanism that can keep a session running indefinitely.

## Out of scope

- Any visible indicator of run progress or which cards will repeat (dots,
  colours, counts) — that is a separate idea, parked in
  [`../IDEAS.md`](../IDEAS.md) pending its own evaluation, and can ship
  independently of this or not at all.
- Typed or auto-checked answers — grading stays self-assessed
  (`again`/`hard`/`good`/`easy`), exactly as it is today.
- Changing the FSRS algorithm, its weights, or its cross-session due-date math
  — untouched by this use case.
- The chronic, cross-session leech case that keeps failing sitting after
  sitting — that is [UC-013](UC-013-stop-losing-time-on-one-card.md)'s
  diagnosis-and-repair answer, not this one. **Resolved 2026-08-12:** a
  same-run repeat does **not** count toward UC-013's suspend counter — only
  cross-session failures do. See [`IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md)
  decision 12.
- **Resolved 2026-08-12 (decision 13):** `again` → re-insert 5 positions ahead;
  `hard` → end of remaining queue; `good`/`easy` → no requeue. No visible
  indicator. Spec: `T-B13`.
