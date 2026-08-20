# UC-049 — Work through an exercise one step at a time

<!-- id: UC-049 -->
<!-- specs: SPEC-feature-exercise-runner, SPEC-feature-practice-surface, SPEC-feature-page-layout, SPEC-page-practice, SPEC-service-material-unit, SPEC-service-exercise-step-components, SPEC-service-exercise-recipe-composer, SPEC-service-method-session-viability, SPEC-service-method-session-budget -->

**Who:** anyone doing an exercise with more than one part — a dictation, a piece
of writing, a 4/3/2 round.
**Wants to:** be led through it step by step, with a timer where something takes
time, and to say for themselves what they actually did.
**So that:** the exercise gets finished, and what the app records about it is
true.

Derived from
[`../study/23-how-an-exercise-runs.md`](../study/23-how-an-exercise-runs.md).

## Today

Exercises are one screen or a stream. Anything needing preparation, waiting or
checking either does not exist in apps or is squeezed into a single view. And
where there is progress, it is inferred from navigation: reaching the last screen
counts as having done the work. That makes every measurement built on it
optimistic.

## Success looks like

- **Method overview before the runner:** hosted exercise methods open
  [`method-detail.md`](../specs/page/method-detail.md) from the catalogue — not
  `/practice` directly. The learner reads what the method does, adjusts setup
  when the method has `materialTopics` / `materialUnits`, and taps **Start** to
  mount the runner. Only the card engine (`srs-session`) may skip this surface.
- An exercise runs as a sequence of typed steps: **prepare** (checklist),
  **do**, **wait** (timer), **submit** (photo or text), **review** (check or
  feedback), **decide** (an offer).
- Recipe text comes from a resolved **material unit** on a Source — not a
  separate per-method sentence file.
- Each step type is filled by a **step component** (audio player, capture,
  self-mark, …) — one runner, many Methods. The full component catalogue and
  per-Method step mixes are specced in
  [`exercise-step-components.md`](../specs/service/exercise-step-components.md)
  and [`exercise-recipe-composer.methods.md`](../specs/service/exercise-recipe-composer.methods.md).
- A **recipe composer** turns Method + material context into the ordered step
  list — fixed template today, algorithmically varied later (short vs long
  dictation, N sentences from weak-audio lemmas, …).
- The learner can move back and forth freely between steps, and a running timer
  keeps running.
- **Navigating is not completing.** Swiping past a step never marks it done;
  marking it done is a separate, single tap.
- Only what is marked done feeds the level model. An exercise that was only
  looked at is recorded as exactly that.
- A timer that runs out is an event, not a verdict — the learner decides whether
  to stop. Pausing is allowed and is recorded.
- Nothing is auto-completed because time ran out.
- At the end, at most **two** offers (take the errors as cards, or have one
  explained first). Declining ends the exercise; nothing is queued, nothing
  returns tomorrow.
- Leaving mid-exercise loses nothing and creates no backlog.
- After two consecutive abandonments the app offers a shorter or better-supported
  variant — once, and without comment.
- **Practice surface:** task copy and controls are large and legible under stress
  (Duolingo-scale prompts, 48px+ prep rows) — not app-settings density.
- **Session contract:** before Start, the method overview names **how many learning
  units** the session contains and **how feedback works** — so four screens never
  hide that the session is one unscored sentence ([`method-session-viability.md`](../specs/service/method-session-viability.md), study/42).
- **Anchored chrome:** on `/practice`, the hero belt stays at the top; segmented
  step progress (**Schritt n/m** + one bar per step) sits in the footer above ◀
  ▶ and the primary CTA, which stay at the bottom across steps; only reading
  steps scroll inside the body (`scroll` / `paginated` profile).
- **Footer segments:** one bar per recipe step; the **current** step reads as
  **primary** while it is still open; completed steps are light accent; visited
  but incomplete steps are gray; untouched steps are neutral line — same
  resolution as [`exercise-runner.layout.md`](../specs/feature/exercise-runner.layout.md).
- **Content profiles:** recipe authors declare whether a step is short, scrollable,
  or paginated — long text never pushes the footer down.

## Out of scope

Editing the step sequence, building your own exercises, and grading how long each
step took.
