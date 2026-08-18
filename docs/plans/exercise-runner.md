# Plan — exercise runner (UC-049)

**Status: active queue.** Specs shipped 2026-08-17. Parent vision:
[`study/23-how-an-exercise-runs.md`](../study/23-how-an-exercise-runs.md).

**What this file owns:** build order for the cooking-app runner — the second
engine family after the card engine. Project-wide queue:
[`IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md).

## What is specced, not built

| Layer | Spec | Code |
| --- | --- | --- |
| Material setup (pre-Start) | `method-material-setup.md` (draft) | — |
| Audio-gap `do` component | study/37 | text gaps v1 only (T-E8) |

**Shipped 2026-08-18:** runner shell + six step types, `/practice`, fixture
end-to-end, **partial dictation from catalogue Source** (`es-fixture-cafe`
default; `sourceId` param).

## Build order

Load-bearing — do not skip skeleton before components.

| ID | Work | Class | Depends on | Done when |
| --- | --- | --- | --- | --- |
| **T-E1** | ~~**Runner skeleton**~~ — **shipped 2026-08-18** | Standard | specs | `npm test -- exercise-runner` green |
| **T-E2** | ~~**Steps prepare · do · wait**~~ — **shipped 2026-08-18** | Standard | T-E1 | timer AC green |
| **T-E3** | ~~**Steps submit · review**~~ — **shipped 2026-08-18** | Standard | T-E2 | submit/review AC green |
| **T-E4** | ~~**Step decide**~~ + session complete — **shipped 2026-08-18** | Standard | T-E3 | decline ends with no queue |
| **T-E5** | ~~**Route `/practice`**~~ + `method-session` routing — **shipped 2026-08-18** | Standard | T-E1 | practice.md AC |
| **T-E6** | ~~**Recipe loader**~~ — **shipped 2026-08-18** | Standard | T-E5 | fixture method end-to-end |
| **T-E7** | ~~**Method material setup**~~ panel on detail — **shipped 2026-08-18** | Standard | T-E5 | `method-material-setup.md` AC |
| **T-E8** | ~~**First real method**~~ — partial dictation from catalogue Source — **shipped 2026-08-18** | Sensitive | T-E6, T-W7 | `lib/exercise-recipe/partial-dictation.ts` |
| **T-E9** | **Gap-fill** step — half-filled listen, type/speak, defer fallback | Standard | T-E3, T-MU2, T-LD1 | UC-028 |
| **T-MU1** | ~~Material unit resolver~~ — **shipped 2026-08-18** | Standard | T-W7 | `material-unit.md` AC |
| **T-LD1** | ~~**Can't listen now**~~ — **shipped 2026-08-18** | Standard | method menu | UC-077 |

**Parallel:** T-E7 can run beside T-E2–T-E4. **T-E8 remainder:** audio gaps,
multi-sentence recipes, Start from source detail with `sourceId`.

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
