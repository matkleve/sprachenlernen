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

## Per-step answers

```ts
type StepAnswers = Record<string /* step id */, StepAnswer>;
```

Everything the learner produces belongs to **the step it was produced on**, keyed
by `step.id`. Not to the session.

| Rule | Why |
| --- | --- |
| One entry per step id, created on first write | A recipe with three `sentence-check` items has three independent answers |
| Navigating away never clears an answer | ◀ back to item 1 shows item 1's sentence — losing it was the old model's bug |
| Only the owning step reads or writes its entry | No step may reach into another's answer |
| Nothing is cleared on `done` | **Done** means finished, not discarded |

The superseded model held one session-wide `submitDraft` plus one
`markedErrorTokens` list, so a repeated step had to be *cleared between items* —
which meant the runner reducer carrying a line that knew the string
`"type-with-word"`. A generic reducer that names one Method's component is the
shape of the bug, not a detail of it: the fix is ownership, not a better clear.

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

## Sentence check (one enum per `sentence-check` step)

```ts
type CheckPhase = "writing" | "checking" | "checked" | "unavailable";
```

| From | Legal to | Trigger |
| --- | --- | --- |
| `writing` | `checking` | Learner taps **Prüfen** with non-empty text |
| `checking` | `checked`, `unavailable` | Result arrives |
| `checked` | `writing` | Learner edits the text again |
| `unavailable` | `writing` | Learner edits the text again |

One enum, not a pile of booleans ([`STATE.md`](../../STATE.md) §2): `isChecking`
plus `hasChecked` plus `failed` would allow "checking and failed at once".

**Completion gate.** The step cannot complete in `writing` *before its first
check* — that is the whole point of the method. Once any check has returned, the
step can always complete, findings or not; the primary reads **Trotzdem weiter**
while findings remain. A checker that is wrong must never trap a learner, so
`unavailable` also completes freely.

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
