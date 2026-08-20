# Exercise runner — states

Split child of [`exercise-runner.md`](exercise-runner.md).

## Runner phase (one enum)

```ts
type RunnerPhase = "loading" | "active" | "complete" | "abandoned";
```

| From | Legal to |
| --- | --- |
| `loading` | `active`, `abandoned` |
| `active` | `complete`, `abandoned` |
| `complete` | *(terminal)* |
| `abandoned` | *(terminal)* |

## Per-step status (one enum per step)

```ts
type StepStatus = "unseen" | "seen" | "done" | "skipped";
```

| | Set by |
| --- | --- |
| `unseen` | default |
| `seen` | navigating to the step (◀ ▶ or first paint) |
| `done` | primary action for that step type |
| `skipped` | recipe allows skip (future; v1 has no skip) |

**Navigating never sets `done`.** Only the type-specific primary button does.

## Segment bar visuals (footer)

Data: `stepStatuses[]` + `activeStepIndex`. Display tokens live in
[`exercise-runner.layout.md`](exercise-runner.layout.md) § Step segments.

| Visual | Maps from |
| --- | --- |
| **active** | focused step, not yet **done** |
| **done** | primary action completed for that step |
| **seen** | visited (◀ ▶ or first paint), not active, not **done** |
| **unseen** | never opened |
| **skipped** | reserved — enum only in v1 |

Implement in `ExerciseRunnerProgressBar`: pass `index` and `activeStepIndex`
into segment colour resolution; do not colour solely from `stepStatuses[i]`.

## Single source of truth

`activeStepIndex: number` — which recipe step is focused. Chrome (hero title,
segmented step progress, timer pill, step body) derives from
`recipe.steps[activeStepIndex]` and `stepStatuses[activeStepIndex]`. No surface
stores its own copy of the active step.

## Timer ownership

```ts
type TimerState = {
  stepId: string;
  startedAt: number;
  pausedAt: number | null;
  elapsedMs: number;
};
```

Bound to the `wait` step that started it. Navigation does not reset or pause
unless the learner taps pause. Expiry sets a `timerExpired` flag on that step —
not `done`.

## Terminal states

| State | Meaning |
| --- | --- |
| `complete` | `decide` finished or last step done with no decide |
| `abandoned` | Stop confirmed mid-recipe |

Acting on terminal phases is a no-op.

## Coherence

After `activeStepIndex` changes, hero, body, segmented progress label and timer
pill must all describe the same step in the same render — no residue from the
previous step's labels or controls ([`STATE.md`](../../STATE.md) §6).
