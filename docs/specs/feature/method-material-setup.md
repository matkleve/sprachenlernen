# Method material setup

<!-- id: SPEC-feature-method-material-setup -->
<!-- use-case: UC-046 -->
<!-- use-case: UC-007 -->
<!-- use-case: UC-029 -->
<!-- use-case: UC-030 -->
<!-- use-case: UC-028 -->
<!-- status: active -->

The **Topic** chip row and **material unit** preview on method detail: learner
picks topic (or **Your own**), sees how much material (sentence / paragraph /
window / full), then Start. Study/26 still holds — the app picks the passage,
gaps, and band inside the choice.

UX source: [`../../study/37-content-and-method-setup-ux.md`](../../study/37-content-and-method-setup-ux.md);
units: [`../../study/39-material-units-and-listening-defer.md`](../../study/39-material-units-and-listening-defer.md).

## Scope

- **In:** chip row on [`method-detail.md`](../page/method-detail.md) when
  `materialTopics` is set; **unit preview** when `materialUnits` is set (see
  [`material-unit.md`](../service/material-unit.md)); built-in **App picks** +
  **Your own** chips; catalogue preview per topic chip; upload/paste/link **only**
  when Your own is selected; optional **Keep in my library**; Start gating until
  Source + unit resolve.
- **Out:** free-text topic search; menu card fields; catalogue authoring; LLM
  generation; RSS sync; runner step UI ([`exercise-runner.md`](exercise-runner.md));
  gap scheduling ([`content-gap.md`](content-gap.md)).

**Reuse: `Chip` (selectable), `Button`, `Field`** — topic chips, intake controls.

## Topic chips

Declared per method: `materialTopics: [{ id, labelKey }]`. UI always adds:

| Chip | `id` | Effect |
| --- | --- | --- |
| App picks | `app-pick` | Readiness picks best catalogue Source (comfortable band) |
| *(method topics)* | e.g. `news`, `environment` | Best catalogue Source tagged with that `id` |
| Your own | `own` | Reveals upload / paste / link |

Methods omit the panel when `materialTopics` is absent or empty (`srs-session`).

Upload controls are **hidden** until `own` is selected — never under catalogue
topic chips.

## Material unit preview

When `materialUnits` is declared, show the resolved slice before Start:

| Preview field | Example |
| --- | --- |
| Unit label | *One sentence* · *One paragraph* · *5 min listening* · *Full text* |
| Coverage | *94 % known · comfortable* |
| Time | Method duration hint + unit estimate |

Learner may switch unit when the method lists more than one (chip or compact
select). Resolved unit id is passed on Start (`unitId`, optional `durationSec`
for `window`).

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens method with `materialTopics` | Chip row below badge band; `app-pick` selected |
| 2 | Leaves **App picks** selected | Preview line after resolve; Start enabled |
| 3 | Taps a catalogue topic chip | Filters Sources by topic `id`; preview with coverage % |
| 4 | Topic has no catalogue Sources | Chip disabled or empty-state; suggests **Your own** |
| 5 | Taps **Your own** | Upload / paste / link appear; catalogue preview hidden |
| 6 | Parses own material &lt; 95 % | Support-ladder preview; Start enabled when parsed |
| 7 | Checks **Keep in my library** (own only) | On Start, persists `learner` Source to `/content` |
| 8 | Taps Start | Navigates to `/practice?method=…` with `sourceId`, `topicId`, `unitId`, optional `durationSec`, optional `supportRung` |
| 9 | Method without `materialTopics` | No panel; Start as today |

## States

| State | Trigger | Effect | Terminal? |
| --- | --- | --- | --- |
| `app-pick` | default | No intake UI | no |
| `topic` | catalogue chip | Preview from tagged Sources | no |
| `own` | Your own chip | Intake controls visible | no |
| `resolving` | paste/upload | Start disabled | no |
| `ready` | Source known | Start enabled | no |

## Data

Reads `materialTopics`, `materialUnits`, catalogue Sources (`tags[]` includes
topic `id`), [`material-unit.md`](../service/material-unit.md), coverage service.
Writes optional `learner` Source when keep checked.

## Copy keys

Chip labels and preview strings under `methodMaterial.*` in `messages/en.json`
and `messages/de.json` — see study/37 wireframe labels (*App picks*, *Your own*,
topic `labelKey`s).

## Acceptance criteria

In [`method-material-setup.acceptance-criteria.md`](method-material-setup.acceptance-criteria.md).

## Check

`npm test -- method-material-setup`

## Open

- Exact chip labels per method — ship with first catalogue batch (study/37).
