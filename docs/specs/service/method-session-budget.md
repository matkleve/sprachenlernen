# Method session budget

<!-- id: SPEC-service-method-session-budget -->
<!-- use-case: UC-045 -->
<!-- use-case: UC-049 -->
<!-- use-case: UC-011 -->
<!-- status: active -->

**Wall-clock contract:** each **duration package** on a method is a fixed session
with a validated wall estimate — not a range the menu slider scales at runtime.

Parent: [`method-session-viability.md`](method-session-viability.md) gate G7.
Study: [`../../study/archive/ARCH-045-method-duration-variants.md`](../../study/archive/ARCH-045-method-duration-variants.md)
(owner decision 2026-08-20). Pedagogy — which methods need two packages and how
real content length works: [`../../study/archive/ARCH-046-method-length-and-level-matched-content.md`](../../study/archive/ARCH-046-method-length-and-level-matched-content.md).
Audit: [`../../reviews/design/DR-042-method-usefulness-ux-audit.md`](../../reviews/design/DR-042-method-usefulness-ux-audit.md).

## Scope

- **In:** duration **packages** (`durations[]`); menu **time filter** (separate);
  detail **variant selection**; `variantMinutes` on session URLs; G7 per package;
  session contract display (`~8 min · 4 sentences`).
- **Out:** logging practice time to Progress (F184); pausing mid-session;
  custom minutes outside [`time-scale.md`](time-scale.md); menu slider sizing
  compose volume (retired 2026-08-20).

## Two controls — never one

| Control | Where | Purpose |
| --- | --- | --- |
| **Time filter** | Method menu slider (`?minutes=` on `/methods`) | Show only methods whose **shortest** package fits: `min(durations) ≤ filter` |
| **Duration package** | Method detail variant chips | Learner picks **one fixed session** before Start — **all** catalogue packages shown when `durations.length > 1` |

The menu slider **does not** set session length and **does not** hide detail
chips. It answers UC-045: *what can I do in the time I have?* The detail picker
answers UC-039: *what exactly am I about to do?*

## Definitions

| Term | Meaning |
| --- | --- |
| **Package** | One integer in `durations[]` — a shipped, fixed session variant |
| **variantMinutes** | The package the learner chose — passed as `minutes=` on session URLs |
| **Time filter** | Menu slider value — catalogue filter only |
| **Active learning** | Retrieval, production, timed write, read window, card grades — not prepare/decide chrome |
| **Wall estimate** | `chromeOverheadSec + activeLearningSec` at compose time for **one package** |
| **Tolerance** | Wall estimate must be in **[85 %, 115 %]** of `variantMinutes × 60` |

```ts
type DurationPackage = {
  variantMinutes: number; // one catalogue durations[] value
  learningUnits: number; // fixed at compose for this package — not scaled from menu
  wallEstimateMinutes: number;
};
```

## Catalogue `durations` field

| Rule | Detail |
| --- | --- |
| **Max length** | **2** packages per method — **except card engine** (see below). Validator refuses three or more. |
| **Each value** | A fixed recipe — item count, timer, or read window declared at compose time |
| **Ascending** | Shortest first — used by `min(durations)` for the menu filter |
| **`null`** | Open-ended — method appears only when menu filter is **Endless** |
| **G7** | Each package must pass viability at its `variantMinutes` (T-MV5) |

Methods that cannot honestly offer a package must **remove** that value from
`durations[]` rather than show it on the card.

**Examples (target catalogue):**

| Method | Packages | Fixed compose |
| --- | --- | --- |
| `partial-dictation` | `8`, `15` | N sentences per package (not menu-derived) |
| `full-dictation` | `12`, `25` | N sentences per package |
| `build-a-sentence` | `5`, `10` | 3 vs 5 target words (T-MV2) |
| `free-production` | `10`, `20` | `timed-write.durationSec` fixed per package |

### Card engine exception (`srs-session`) — owner 2026-08-20

| Field | Rule |
| --- | --- |
| **Cards** | **Fixed 15** per session — always; session contract says *"15 cards"* |
| **Due &lt; 15** | Fill remainder with **new** cards (frequency order) until 15 or pool exhausted — owner 2026-08-20. No shorter honest session. |
| **Easy-vocab padding** | **Rejected v1** — do not prefer "easier to translate" lemmas when padding; ordinary new-card order only. |
| **`durations[]`** | **One** value — estimated wall minutes for menu filter only (~`10`) |
| **Variant chips** | **None** — no duration picker on detail |
| **Menu filter** | `min(durations) ≤ filter`; Start URL does not scale card count |

Card count is **never** derived from menu slider or `variantMinutes`.

**Resolved material** (upload, source-bound methods): adapt → estimate → contract
→ Start. See [`method-session-budget.resolved-material.md`](method-session-budget.resolved-material.md).

## Where `variantMinutes` comes from

| Source | Rule |
| --- | --- |
| `durations.length === 1` | That value — no picker |
| Detail variant chips | **All** values in `durations[]` when length > 1 — independent of menu filter |
| Default on detail | **Longest** package in `durations[]` |
| Menu `?minutes=` | **Not** forwarded to `/practice` or `/words/review`; **does not** hide chips |

## URL params

| Route | Param | Meaning |
| --- | --- | --- |
| `/methods` | `minutes` | **Time filter only** — snapped via [`time-scale.md`](time-scale.md) |
| `/practice` | `minutes` | **`variantMinutes`** — exact catalogue package chosen on detail |
| `/words/review` | `minutes` | **`variantMinutes`** — exact card-engine package |
| `/practice` | `durationSec` | Material read window when applicable — must match package definition |

## Compose rules (fixed packages)

Composers receive `variantMinutes` (or `variantId` where mapped) and return a
**fixed** recipe. **Forbidden:** deriving item count from the menu time filter.

| Family | Package defines |
| --- | --- |
| **Card** (`srs-session`) | **Fixed `cardCount = 15`** — not in table above |
| **Item loop** (dictation, build-a-sentence) | Fixed `N` per package |
| **Timed write** (`free-production`, diary) | Fixed `timed-write.durationSec` per package |
| **Read window** (extensive-reading, reading-aloud) | Fixed `durationSec` on `window` unit per package |
| **Fixed ritual** (4/3/2) | Package must match ritual exactly |

Constants and per-method tables live in `lib/exercise-recipe/budget.ts` until
each composer ships fixed tables (T-MV5).

**Chrome overhead caps** (prepare + decide + nav):

| Engine | `chromeOverheadSec` cap |
| --- | --- |
| Exercise runner | 120 |
| Card review | 60 |

## Session contract (detail)

```ts
type SessionContract = {
  variantMinutes: number;
  learningUnits: number;
  feedbackMode: SessionFeedbackMode;
  feedbackLabelKey: string;
  wallEstimateMinutes: number;
  volumeLabelKey: string;
};
```

Shown above Start — e.g. *"~8 min · 4 sentences · self-mark"*. Updates when the
learner switches variant chips.

## Behaviour

| # | Input | Output |
| --- | --- | --- |
| 1 | Menu filter 15 min, method `durations: [8, 15]` | Method **visible** (`8 ≤ 15`). Menu URL keeps `minutes=15`. |
| 2 | Opens detail from that context | Variant chips **8** and **15** (both packages); default **15** |
| 3 | Starts with 15 chip | `/practice?method=…&minutes=15` — compose **15 min package** |
| 4 | Menu filter 5 min, method `durations: [8, 15]` | Method **absent** (`8 > 5`) |
| 4b | Menu filter 10 min, same method on detail | Still shows chips **8** and **15** when opened; default **15** |
| 5 | Menu Endless | All methods with any `durations`; detail shows all packages |
| 6 | `durations: [10]` | No variant chips; contract shows single package |

## Acceptance criteria

In [`method-session-budget.acceptance-criteria.md`](method-session-budget.acceptance-criteria.md).

## Check

`npm test -- exercise-recipe session-builder time-scale method-session-budget`

## Open

- **⚠ SPEC GAP:** chip labels for two duration packages — e.g. *Short · 4
  sentences* vs *Standard · 8 sentences* — copy keys in
  `methodMenu.durationVariant.*`. From
  [`ARCH-045-method-duration-variants.md`](../../study/archive/ARCH-045-method-duration-variants.md).
- **⚠ SPEC GAP:** when material `unitId` and duration package disagree, which
  wins? Proposal: duration package is primary; material unit is sub-choice within
  a package where both apply (dictation).
