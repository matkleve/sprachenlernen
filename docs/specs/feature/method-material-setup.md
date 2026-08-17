# Method material setup

<!-- id: SPEC-feature-method-material-setup -->
<!-- use-case: UC-046 -->
<!-- use-case: UC-007 -->
<!-- use-case: UC-029 -->
<!-- use-case: UC-030 -->
<!-- status: draft -->

The **What to practise with** panel on method detail: how the learner steers
topic and own material before **Start**. Study/26 still holds — the app picks
gaps, sentences, and band; the learner picks method + material mode.

UX source: [`../../study/37-content-and-method-setup-ux.md`](../../study/37-content-and-method-setup-ux.md).
Resolved Source feeds [`coverage.md`](../service/coverage.md) and the reading /
dictation runners (T-W10+).

## Scope

- **In:** setup panel on [`method-detail.md`](../page/method-detail.md) when
  `materialModes` is non-empty; three modes (app pick · topic · own material);
  optional **Keep in my library**; Start gating until a Source resolves;
  coverage preview before Start for learner material.
- **Out:** menu card fields; catalogue authoring; LLM topic generation; RSS
  sync; runner steps (study/23); gap scheduling ( [`content-gap.md`](content-gap.md) ).

**Reuse: `Field`, `Button`, `Disclosure`** — topic input, upload actions, ladder
preview.

## Material modes

Declared per method in catalogue data (`materialModes`). Subset of:

| Mode | Learner sees | App does on Start |
| --- | --- | --- |
| `catalogue` | *App picks for me* + coverage hint | Readiness picks catalogue Source in comfortable band |
| `topic` | Free-text topic field + best-match line | Rank catalogue Sources by tag/title fit + coverage |
| `learner` | Upload / paste / link | Intake → coverage → optional support ladder (UC-030) |

Methods omit the panel when `materialModes` is absent or empty (`srs-session`).

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens method with `materialModes` | Setup panel below badge band; `catalogue` selected if listed |
| 2 | Leaves *App picks* selected | Start enabled; no extra fields |
| 3 | Selects *About a topic* | Topic `Field` appears; debounced best-match line with coverage % |
| 4 | Topic matches nothing within 20 pts of comfortable | Inline copy + learner intake affordance (no LLM text gen) |
| 5 | Selects *My own material* | Upload / paste / link controls; coverage after parse |
| 6 | Material &lt; 95 % | Support-ladder preview (lowest rung to comfortable); does not block Start |
| 7 | Checks **Keep in my library** | On Start, persists `learner` Source to `/content` |
| 8 | Unchecked keep | Session-only Source — no `/content` row; no word-trace link after |
| 9 | Taps Start with resolved Source | Navigates to runner with `sourceId` (and `supportRung` if set) |
| 10 | Opens method without `materialModes` | No panel; Start behaves as today |

## States

| State | Trigger | Effect | Terminal? |
| --- | --- | --- | --- |
| `idle` | page load | Default mode selected | no |
| `resolving` | paste/upload | Spinner; Start disabled | no |
| `ready` | Source + coverage known | Start enabled | no |
| `error` | parse failed | Inline error; Start disabled | no |

## Data

Reads method entry `materialModes`, catalogue Sources, coverage service. Writes
optional new `learner` Source when keep checked.

## Acceptance criteria

In [`method-material-setup.acceptance-criteria.md`](method-material-setup.acceptance-criteria.md).

## Check

`npm test -- method-material-setup`

## Open

- Catalogue `tags[]` schema — defer until first catalogue batch (study/37).
