# Method session budget

<!-- id: SPEC-service-method-session-budget -->
<!-- use-case: UC-045 -->
<!-- use-case: UC-049 -->
<!-- use-case: UC-011 -->
<!-- status: draft -->

**Wall-clock contract:** when a method card says **5 minutes**, or the learner
picked **15 minutes** on the method menu, the hosted session's **estimated
active learning time** fills that budget — not a token label on the card with a
two-minute tap-through behind it.

Parent: [`method-session-viability.md`](method-session-viability.md) gate G7.
Study audit: [`../../study/42-method-usefulness-ux-audit.md`](../../study/42-method-usefulness-ux-audit.md).

## Scope

- **In:** `budgetMinutes`; URL param `minutes`; composer scaling rules; tolerance
  band; per-engine overhead; catalogue `durations` as **selectable variants**;
  session contract display (`~10 min · 6 sentences`).
- **Out:** logging practice time to Progress (F184); pausing mid-session;
  custom minutes outside [`time-scale.md`](time-scale.md).

## Definitions

| Term | Meaning |
| --- | --- |
| **Budget** | `budgetMinutes` — learner-facing session length in minutes |
| **Active learning** | Retrieval, production, timed write, read window, card grades — not prepare/decide chrome |
| **Wall estimate** | `chromeOverheadSec + activeLearningSec` at compose time |
| **Tolerance** | Wall estimate must be in **[85 %, 115 %]** of `budgetMinutes × 60` |

```ts
type SessionBudget = {
  budgetMinutes: number; // integer; snapped — see below
  chromeOverheadSec: number; // declared per method family at compose
  activeLearningSec: number; // sum of timed steps + item estimates
};
```

## Where budget comes from

| Source | Rule |
| --- | --- |
| Method menu `?minutes=` | Passed through detail Start → practice / words review |
| Method detail duration chip | When `durations.length > 1`, learner picks one variant before Start |
| Single catalogue duration | That value is the budget |
| Material `window` unit | `durationSec` defaults to `budgetMinutes × 60` when both set |
| Endless menu filter | No budget cap — method uses its **longest** declared variant |

**Snap:** menu minutes snap via [`time-scale.md`](time-scale.md), then clamp to
`[min(durations), max(durations)]` for that method. If menu budget is below
`min(durations)`, detail shows the minimum variant honestly — do not Start below
catalogue minimum without a shorter variant existing.

## URL params

| Route | Param | Meaning |
| --- | --- | --- |
| `/practice` | `minutes` | `budgetMinutes` for exercise runner compose |
| `/words/review` | `minutes` | Card count from budget (session-builder) |
| `/practice` | `durationSec` | Material window only — must equal `budgetMinutes × 60` when both present |

`minutes` on the menu filter **narrows the catalogue** and **sets the default
budget** for sessions started from that browse context — not two separate concepts.

## Composer scaling (by engine family)

| Family | Active learning fills budget by |
| --- | --- |
| **Card** (`srs-session`) | `cardCount = round(budgetMinutes × 60 / SEC_PER_CARD)` — default `SEC_PER_CARD = 35` |
| **Item loop** (dictation, build-a-sentence) | `N = clamp(floor(activeSec / SEC_PER_ITEM), MIN_ITEMS, MAX_ITEMS)` |
| **Timed write** (`free-production`, diary) | `timed-write.durationSec = activeSec` |
| **Read window** (extensive-reading, reading-aloud) | `window` unit with `durationSec = activeSec` (≈150 wpm) |
| **Fixed ritual** (4/3/2) | Budget must match declared variant exactly — no scaling |

Constants live in `lib/exercise-recipe/budget.ts` (future); v1 documents targets in
[`exercise-recipe-composer.methods.md`](exercise-recipe-composer.methods.md).

**Chrome overhead caps** (prepare + decide + nav, not per-step body):

| Engine | `chromeOverheadSec` cap |
| --- | --- |
| Exercise runner | 120 |
| Card review | 60 |

Prepare omitted when [`method-session-viability.md`](method-session-viability.md) G6 applies — reduces overhead.

## Catalogue `durations` field

Each entry in `durations[]` is a **shipped session budget variant**, not a fuzzy
hint. Validator (future `T-MV5`) runs `estimateWallClock(methodId, variant)` and
**refuses** catalogue data when estimate falls outside tolerance.

Methods that cannot honestly offer a variant must **remove** that minute value
from `durations` rather than show it on the card.

## Session contract (detail + overview)

Extend [`method-session-viability.md`](method-session-viability.md) `SessionContract`:

```ts
budgetMinutes: number;
wallEstimateMinutes: number; // composer estimate, shown as "~10 min"
volumeLabelKey: string; // e.g. "6 sentences", "15 cards"
```

## Behaviour

| # | Input | Output |
| --- | --- | --- |
| 1 | Menu at 15 min, method durations `[10, 20]` | Default budget **15** clamped to **15**; compose at 15 |
| 2 | Menu at 5 min, method durations `[8, 15]` | Detail shows **8 min** minimum; Start uses 8 |
| 3 | `build-a-sentence` at `budgetMinutes: 8` or `15` | Estimate within tolerance — min catalogue variant is **8 min** |
| 4 | `partial-dictation` short variant | Estimate ~5–6 min — **fails** catalogue min 8 until N raised or min lowered |

## Acceptance criteria

In [`method-session-budget.acceptance-criteria.md`](method-session-budget.acceptance-criteria.md).

## Check

`npm test -- exercise-recipe session-builder time-scale`
