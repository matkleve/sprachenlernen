# Time scale — method menu budget steps

<!-- id: SPEC-service-time-scale -->
<!-- use-case: UC-045 -->
<!-- status: active -->

Discrete time budgets for the method-menu slider. **Standard** — pure functions
in `lib/time-scale.ts`, no React.

## Scope

- **In:** `TIME_SCALE_MINUTES`, `budgetFromStepIndex`, `stepIndexFromBudget`,
  `closestBudget`, `formatTimeBudget`, default **15** minutes, final **Endless**
  step (UC-048).
- **Out:** per-method duration editing; a learner-chosen custom minute value
  outside the scale; session length for hosted methods (fixed packages on detail —
  [`method-session-budget.md`](method-session-budget.md)).

## Behavior

| # | Input | System response |
| --- | --- | --- |
| 1 | Slider at step 0 | Budget **2** minutes |
| 2 | Steps through the scale | Minutes jump by the table — dense at the short end (2→15), sparse through hours, **1440** (one day) last |
| 3 | Final step | Budget **endless** — time filter removed from the catalogue |
| 4 | URL `?minutes=37` (legacy) | Snaps to nearest step (**40**) for display and filtering |
| 5 | URL `?minutes=endless` | Endless step selected |

Steps (minutes): 2, 3, 5, 7, 10, 12, 15, 20, 25, 30, 40, 50, 60, 90, 120, 180,
240, 360, 480, 720, 1440, then endless.

Linear interpolation between minutes is **forbidden** — the slider has discrete
positions only.

## States

Not a UI machine.

## Acceptance criteria

- [ ] Given step index 0, when `budgetFromStepIndex` runs, then the budget is
      2 minutes.
- [ ] Given the final step index, when `budgetFromStepIndex` runs, then the
      budget is `endless`.
- [ ] Given budget 37 minutes, when `closestBudget` runs, then the result is 40.
- [ ] Given `endless`, when the method filter runs, then no method is excluded
      for duration.
- [ ] Given two adjacent step indices, when their minute values are compared,
      then the increment is not uniform across the whole scale (dense below 15).

## Check

`npm test -- time-scale method-menu-filter`
