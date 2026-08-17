# Plan — exercise runner (UC-049)

**Status: active queue.** Specs shipped 2026-08-17. Parent vision:
[`study/23-how-an-exercise-runs.md`](../study/23-how-an-exercise-runs.md).

**What this file owns:** build order for the cooking-app runner — the second
engine family after the card engine. Project-wide queue:
[`IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md).

## What is specced, not built

| Layer | Spec | Code |
| --- | --- | --- |
| Runner shell + FSM | `exercise-runner.md`, `.states.md` | — |
| Route | `practice.md` | — |
| Material setup (pre-Start) | `method-material-setup.md` (draft) | — |
| First reference method | study/37 partial dictation | blocked on T-W7 for real Source |

## Build order

Load-bearing — do not skip skeleton before components.

| ID | Work | Class | Depends on | Done when |
| --- | --- | --- | --- | --- |
| **T-E1** | **Runner skeleton** — `features/exercise-runner/`, phase FSM, chrome (nav, bar, stop), fixture recipe | Standard | specs | `npm test -- exercise-runner` green for nav + seen/done |
| **T-E2** | **Steps prepare · do · wait** — checklist, prompt, timer pill + pause | Standard | T-E1 | AC timer survives navigation |
| **T-E3** | **Steps submit · review** — capture (photo+text), self-mark, compare, feedback placeholder | Standard | T-E2 | submit/review AC green |
| **T-E4** | **Step decide** + session complete surface | Standard | T-E3 | decline ends with no queue |
| **T-E5** | **Route `/practice`** + `lib/method-session.ts` exercise href; page-layout registry | Standard | T-E1 | practice.md AC |
| **T-E6** | **Recipe loader** — `lib/exercise-recipe.ts`, validate catalogue recipes | Standard | T-E5 | one fixture method end-to-end |
| **T-E7** | **Method material setup** panel on detail | Standard | T-E5 | `method-material-setup.md` AC |
| **T-E8** | **First real method** — partial dictation from catalogue Source | Sensitive | T-E6, **T-W7** | study/37 worked example |

**Parallel:** T-E7 can run beside T-E2–T-E4. T-E8 waits on coverage calculator.

**Not this runner:** `srs-session`, form-recall card queue (`form-practice.md` /
T-W6) — card engine on `/words/review`.

## Agent handoff template

```markdown
Task: T-En <one line>
Change class: Standard | Sensitive
Reuse: exercise-runner shell | Gap: <component>

Files you may touch: <exact paths>
Serves: UC-049
Spec: docs/specs/feature/exercise-runner.md

Done when:
  - npm run verify green (paste output)
  - spec AC ↔ tests one-to-one
```
