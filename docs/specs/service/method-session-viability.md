# Method session viability

<!-- id: SPEC-service-method-session-viability -->
<!-- use-case: UC-049 -->
<!-- use-case: UC-046 -->
<!-- status: draft -->

Minimum **learning-science and UX contract** for every **hosted** Method whose
session runs in-app (`hosted: true` and engine `card` or `runner`). Prevents
catalogue entries that are evidence-grade on paper but hollow in the runner —
see [`../../study/42-method-usefulness-ux-audit.md`](../../study/42-method-usefulness-ux-audit.md).

Parent: [`method-catalogue.md`](method-catalogue.md). Recipes:
[`exercise-recipe-composer.md`](exercise-recipe-composer.md). Runner:
[`exercise-runner.md`](../feature/exercise-runner.md).

## Scope

- **In:** six viability gates (G1–G6); `SessionContract` shape for method detail;
  composer/linter rules for hosted recipes; feedback modes.
- **Out:** off-app methods (debrief-only); menu ranking; LLM correction quality
  tiers beyond honest placeholder copy.

## The six gates

| Gate | Rule |
| --- | --- |
| **G1 Retrieval** | At least one `do` or card Task requires recall/production, not exposure-only |
| **G2 Feedback** | Every production `do` has a following `review` with `self-mark`, `compare`, `diff-highlight`, `feedback`, or `rubric` — **or** `reveal-answer` with `config.exemplar` **or** `config.honestyKey` |
| **G3 Volume** | `learningUnits ≥ 3` **or** `durationSec ≥ 480` on a timed `do` **or** card stream `≥ 10` tasks |
| **G4 Whole-task** | Catalogue `doesNotDo` names the limit; recipe does not pretend to exceed it |
| **G5 Honest done** | Primary on production `do` does not set `done` without a review step marked done or explicit learner skip with copy |
| **G6 Overhead** | `prepare` omitted when recipe meta `prepareRequired: false` and only `keyboard`/`touch` writing |

`learningUnits` = counted at compose time: loop iterations, dictation sentences,
target words, card tasks, timed-write blocks — not runner chrome steps.

## Feedback modes (declared)

| Mode | Components | Detail label key |
| --- | --- | --- |
| `self-mark` | `self-mark` | `sessionFeedbackSelfMark` |
| `exemplar` | `reveal-answer` with exemplar | `sessionFeedbackExemplar` |
| `assisted` | `feedback` | `sessionFeedbackAssisted` |
| `rubric` | `rubric` | `sessionFeedbackRubric` |
| `honest-none` | `reveal-answer` + `honestyKey` only | `sessionFeedbackHonestNone` |

Production methods **forbidden:** `reveal-answer` without exemplar or honesty key.

## Session contract (method detail)

```ts
type SessionContract = {
  learningUnits: number;
  feedbackMode: "self-mark" | "exemplar" | "assisted" | "rubric" | "honest-none";
  feedbackLabelKey: string; // i18n for detail surface
  estimatedMinutes: number; // from catalogue duration variant or compose
};
```

Hosted methods expose a contract **before Start** on
[`method-detail.md`](../page/method-detail.md) — e.g. *"5 sentences · compared to
examples"*.

## Composer rules

1. `compose*Recipe` return value is run through `assertSessionViable(recipe)` in
   tests and CI (`T-MV1`).
2. Failing recipe → composer throws in dev/CI; production returns `null` and
   detail shows not-built honestly.
3. [`exercise-recipe-composer.methods.md`](exercise-recipe-composer.methods.md)
   **target** column documents intended mix; **shipped** must pass gates.

## Behaviour

| # | Input | Output |
| --- | --- | --- |
| 1 | `build-a-sentence` recipe today | **Fails** G2, G3, G6 — see study/42 |
| 2 | `partial-dictation` N=1 | Passes with **warning** on G3 — prefer N≥3 in `standard` |
| 3 | `free-production` | Passes G2 via `feedback` placeholder |
| 4 | Valid composed recipe | `SessionContract` for detail |

## Acceptance criteria

In [`method-session-viability.acceptance-criteria.md`](method-session-viability.acceptance-criteria.md).

## Check

`npm test -- exercise-recipe`
