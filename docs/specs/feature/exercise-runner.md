# Exercise runner

<!-- id: SPEC-feature-exercise-runner -->
<!-- use-case: UC-049 -->
<!-- use-case: UC-046 -->
<!-- use-case: UC-028 -->
<!-- status: active -->

The **cooking-app runner** for catalogue Methods: prepare → do → wait → submit
→ review → decide. **Graded** sessions score or compare work; **guided**
sessions structure off-screen practice with `confirm-done` ([`method-guided-sessions.md`](../service/method-guided-sessions.md)).
One reusable shell; each Method supplies an ordered **recipe** of typed steps
filled with **step components**. Parent vision:
[`../../study/23-how-an-exercise-runs.md`](../../study/23-how-an-exercise-runs.md).

Route: [`../page/practice.md`](../page/practice.md). Material setup before
Start: [`method-material-setup.md`](method-material-setup.md). Card-engine Methods
stay on [`../page/words-review.md`](../page/words-review.md) — not this runner.

## Scope

- **In:** runner chrome (step nav, duration bar, timer pill, abandon); six step
  types; component catalogue; recipe data shape; seen/done per step; timer
  ownership; session-only submit artefacts (photo, text).
- **Out:** building every catalogue Method; LLM correction pipeline (review
  `feedback` v1 is honest placeholder); editing recipes in the UI; per-step
  duration grading; level-model credit for half-finished exercises (SPEC GAP in
  study/23).

**Reuse:** `Button`, `StatusBanner`, `Field`, `page-layout` `one-screen-runner`.

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
`feedback` (placeholder), `offers`, `wait` (timer). New components extend the
registry; new Methods do not fork the runner.

## Runner chrome

Persistent on every step (mobile `one-screen-runner`):

| Control | Behaviour |
| --- | --- |
| Back chip | Shell — confirm abandon if mid-recipe |
| Title | Method name + optional step label |
| Duration bar | Remaining exercise time **or** step index — recipe declares which |
| Timer pill | Visible while any `wait` timer is running; survives step navigation |
| ◀ / ▶ | Free navigation; sets **seen**, never **done** |
| **Fertig** / **Weiter** / **Eingereicht** / **Durchgesehen** | Primary per type — marks **done** once |
| ✕ Stop | Confirm: progress lost, no backlog ([study/23](../../study/23-how-an-exercise-runs.md)) |

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
| 2 | Lands on first step | Recipe loaded; step 1 rendered; duration bar shown |
| 3 | Taps ▶ without **Fertig** | Next step **seen**; prior step not **done**; timer keeps running |
| 4 | Taps **Fertig** on a `do` step | That step **done**; advances to next |
| 5 | `submit` with `capture` | Photo stored session-local; text in memory; **Eingereicht** requires ≥1 per `accept` |
| 6 | `review` + `self-mark` | Answer key visible; tapped tokens become error list for `decide` |
| 7 | `decide` decline | Exercise **complete**; nothing queued |
| 8 | Stop mid-recipe | No persistence beyond optional session log; no backlog |

## States

See [`exercise-runner.states.md`](exercise-runner.states.md).

## Acceptance criteria

In [`exercise-runner.acceptance-criteria.md`](exercise-runner.acceptance-criteria.md).

## Check

`npm test -- exercise-runner`
