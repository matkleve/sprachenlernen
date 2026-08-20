# Plan — exercise runner (UC-049)

**Status: active queue.** Specs shipped 2026-08-17. Parent vision:
[`study/STUDY-021-how-an-exercise-runs.md`](../study/STUDY-021-how-an-exercise-runs.md).

**What this file owns:** build order for the cooking-app runner — the second
engine family after the card engine. Project-wide queue:
[`IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md).

## What is specced, not built

| Layer | Spec | Code |
| --- | --- | --- |
| Audio playback for text sources | study/37 | **shipped 2026-08-18** — browser TTS via `speechText` on dictation steps |
| Speak input mode | UC-028 | type-only v1 |

**Shipped 2026-08-18:** runner shell + six step types, `/practice`, catalogue
partial dictation, **material setup** (T-E7), **principled gaps** (T-MU2),
**gap-fill step** (T-E9), six hosted Methods, **practice-surface UX** (T-E12).

**Specced 2026-08-18:** step-component catalogue (41 runner + 5 card-engine) and
per-Method recipe mixes for all catalogue Methods —
[`exercise-step-components.md`](../specs/service/exercise-step-components.md),
[`exercise-recipe-composer.methods.md`](../specs/service/exercise-recipe-composer.methods.md).

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
| **T-E9** | ~~**Gap-fill** step — half-filled listen, type/speak, defer fallback~~ — **shipped 2026-08-18** | Standard | T-E3, T-MU2, T-LD1 | UC-028 |
| **T-MU1** | ~~Material unit resolver~~ — **shipped 2026-08-18** | Standard | T-W7 | `material-unit.md` AC |
| **T-LD1** | **Can't listen now** — infra shipped; menu UI removed 2026-08-18; UI on mixed stacks | Standard | session chrome | UC-077 |
| **T-E10** | ~~**Component registry**~~ — **shipped 2026-08-18** | Standard | T-E1 | `exercise-step-components.md` AC |
| **T-E11** | ~~**Recipe composer**~~ — **shipped 2026-08-18** | Standard | T-E6 | `exercise-recipe-composer.md` AC |
| **T-E12** | ~~**Practice-surface UX + anchored layout**~~ — **shipped 2026-08-18** | Standard | T-E1 | [`practice-surface.md`](../specs/feature/practice-surface.md), [`exercise-runner.layout.md`](../specs/feature/exercise-runner.layout.md) AC |

**Not this runner:** `srs-session`, form-recall card queue — card engine on `/words/review`.
Catalogue cards for exercise methods open **method overview** first; Start on detail
mounts `/practice` ([`method-detail.md`](../specs/page/method-detail.md)).

## Method viability + session budget (study/42) — next queue

Runner platform shipped; several **built** methods fail usefulness or duration
gates. Specs:
[`method-session-viability.md`](../specs/service/method-session-viability.md),
[`method-session-budget.md`](../specs/service/method-session-budget.md).

| ID | Work | See |
| --- | --- | --- |
| **T-MV1–T-MV8, T-CI1–T-CI8** | Viability, filter-only menu time, content ingest/adapt | [`IMPLEMENTATION-PLAN.md`](../IMPLEMENTATION-PLAN.md) Track B |

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
