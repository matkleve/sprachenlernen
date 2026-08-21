# Exercise runner

<!-- id: SPEC-feature-exercise-runner -->
<!-- use-case: UC-049 -->
<!-- use-case: UC-046 -->
<!-- use-case: UC-028 -->
<!-- status: active -->

The **cooking-app runner** for multi-step Methods: prepare → do → wait → submit
→ review → decide. One reusable shell; each Method supplies an ordered **recipe**
of typed steps filled with **step components**. Parent vision:
[`../../study/STUDY-021-how-an-exercise-runs.md`](../../study/STUDY-021-how-an-exercise-runs.md).

Route: [`../page/practice.md`](../page/practice.md). Layout zones:
[`exercise-runner.layout.md`](exercise-runner.layout.md). Task UI scale:
[`practice-surface.md`](practice-surface.md). Material setup before
Start: [`method-material-setup.md`](method-material-setup.md). Card-engine Methods
stay on [`../page/words-review.md`](../page/words-review.md) — not this runner.

## Scope

- **In:** runner chrome (step nav, segmented step progress, timer pill, abandon);
  six step
  types; component catalogue; recipe data shape; seen/done per step; timer
  ownership; session-only **per-step answers** (text, photo, marked tokens,
  check results).
- **Out:** building every catalogue Method; LLM correction pipeline (review
  `feedback` v1 is honest placeholder); editing recipes in the UI; per-step
  duration grading; level-model credit for half-finished exercises (SPEC GAP in
  study/23).

**Reuse:** `Button`, `StatusBanner`, `Field`, `page-layout` `one-screen-exercise`.

## Step types

| Type | Role | Done means |
| --- | --- | --- |
| `prepare` | Physical checklist | Learner tapped **Weiter** (checkboxes optional) |
| `do` | One task, one screen | Learner tapped **Fertig mit diesem Schritt** |
| `wait` | Timer owned by this step | Learner tapped **Weiter** after expiry or early |
| `submit` | Hand in work — photo and/or text | Learner tapped **Eingereicht** |
| `review` | Check, compare, or feedback | Learner tapped **Durchgesehen** |
| `decide` | At most two offers | Learner chose or declined — terminal for exercise |

Not every recipe uses all six. `srs-session` does **not** use this runner.

## Step components

A step's `component` selects the UI widget. The full catalogue (forty-one
runner components + five card-engine Task types), build status, and per-Method
demand live in [`exercise-step-components.md`](../service/exercise-step-components.md).

Shipped today: `checklist`, `prompt`, `gap-fill`, `capture`, `self-mark`,
`feedback` (placeholder), `sentence-check`, `offers`, `wait` (timer). New
components extend the registry; new Methods do not fork the runner.

A component is declared **once**, as a descriptor: its id, the step types it may
fill, how it parses its own `config`, whether the step can complete, and its
primary label. Shipped ids, allowed types and the render switch are *derived*
from those descriptors — four parallel lists were how a component could be
half-registered and fall through to not-built copy in silence.

**Session findings.** A `decide` component may read every step's answer, read
only — a closing step is *about* the session, and assembling the recap anywhere
else would put it somewhere that knows less. `summariseSessionFindings` is the
one function allowed to cross steps; no other component receives it.

**No offer the runner does not perform.** Selecting an offer is wired to
"complete the step" and nothing else, so a button reading *"Schedule this word
for review"* promises something that never happens. A closing step states what
was found; an offer belongs there only once the action behind it exists.

## Runner chrome

Layout zones and content profiles: [`exercise-runner.layout.md`](exercise-runner.layout.md).
Parent shell mode: `one-screen-exercise` on `/practice` (mobile + desktop).

| Zone | Components | Notes |
| --- | --- | --- |
| Hero | `ExerciseRunnerHero` | Section WebP full-bleed; section name + **Methoden** label + method title + step label on gradient; **Übung beenden** top-right |
| Progress | `ExerciseRunnerProgress` | **Footer** — one segment per step (not one continuous bar); **Schritt n/m** label; timer pill when `wait` active |
| Body | `ExerciseStepBody` | Scrolls inside frame; practice-surface scale |
| Footer | `ExerciseRunnerFooter` | Segmented progress + label; anchored `shrink-0`; ◀ ▶ above primary; primary `lg`, `w-auto`, bottom-right; canvas scrim above controls |

**Invariant:** footer controls stay at the same vertical position across steps on
one device — only the body scrolls ([`exercise-runner.layout.md`](exercise-runner.layout.md)).

| Control | Behaviour |
| --- | --- |
| ◀ / ▶ | Free navigation; sets **seen**, never **done** |
| **Weiter** / **Fertig** / **Eingereicht** / **Durchgesehen** | Primary — marks **done** once. Label and enabled-ness come from the step's component descriptor, falling back to the step type; a component that gates itself (`sentence-check` before its first check) says so there, never in runner chrome |
| ✕ Stop (hero) | Confirm: progress lost, no backlog ([study/23](../../study/STUDY-021-how-an-exercise-runs.md)) |

Timer rules: expiry is an event, not auto-done; pause is allowed and recorded.

## Recipe shape

```ts
type StepType =
  | "prepare" | "do" | "wait" | "submit" | "review" | "decide";

type ExerciseRecipe = {
  methodId: string;
  sourceId?: string;
  steps: Array<{
    id: string;
    type: StepType;
    component?: string;
    label?: string;
    config: Record<string, unknown>;
  }>;
};
```

Recipes are composed at session start from **material unit** + Method template
([`material-unit.md`](../service/material-unit.md),
[`exercise-recipe-composer.md`](../service/exercise-recipe-composer.md)).
Per-Method step mixes: [`exercise-recipe-composer.methods.md`](../service/exercise-recipe-composer.methods.md).
Implementation: `lib/exercise-recipe.ts`, `lib/exercise-recipe/partial-dictation.ts`.

## Behaviour

| # | User action | System response |
| --- | --- | --- |
| 1 | Taps Start on method detail (exercise engine) | Navigates to `/practice?method=…` (+ `sourceId` when setup resolved) |
| 2 | Lands on first step | Recipe loaded; step 1 rendered; footer shows segmented progress + **Schritt 1/m** |
| 3 | Taps ▶ without **Fertig** | Next step **seen**; prior step not **done**; timer keeps running; **the answer on the step left behind is kept** |
| 4 | Taps **Fertig** on a `do` step | That step **done**; advances to next |
| 5 | `submit` with `capture` | Photo stored session-local; text in memory; **Eingereicht** requires ≥1 per `accept` |
| 6 | `review` + `self-mark` | Answer key visible; tapped tokens become error list for `decide` |
| 6b | `do` + `sentence-check` | Writes, taps **Prüfen**, corrects, re-checks; see [`sentence-check.md`](../service/sentence-check.md) |
| 6c | `decide` + `summary` after checked steps | Recap of what the checks found across the session — categories by frequency, the marked words, and what was examined |
| 7 | `decide` decline | Exercise **complete**; nothing queued |
| 8 | Stop mid-recipe | No persistence beyond optional session log; no backlog |

## States

See [`exercise-runner.states.md`](exercise-runner.states.md).

## Acceptance criteria

In [`exercise-runner.acceptance-criteria.md`](exercise-runner.acceptance-criteria.md).

## Check

`npm test -- exercise-runner`

## Open

- **⚠ SPEC GAP:** whether an exercise abandoned halfway counts partially toward
  the level model, or not at all. Both are defensible; the study rule is that
  guessing would invent measurement — carried from
  [`STUDY-021-how-an-exercise-runs.md`](../../study/STUDY-021-how-an-exercise-runs.md).
