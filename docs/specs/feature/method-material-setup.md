# Method material setup

<!-- id: SPEC-feature-method-material-setup -->
<!-- use-case: UC-046 -->
<!-- use-case: UC-007 -->
<!-- use-case: UC-029 -->
<!-- use-case: UC-030 -->
<!-- status: draft -->

The **Topic** chip row on method detail: learner picks from topics this method
supports, or **Your own** for upload/paste. Study/26 still holds — the app picks
the passage, gaps, and band inside the choice.

UX source: [`../../study/37-content-and-method-setup-ux.md`](../../study/37-content-and-method-setup-ux.md)
(owner correction 2026-08-17: chips, not free-text topic).

## Scope

- **In:** chip row on [`method-detail.md`](../page/method-detail.md) when
  `materialTopics` is set; built-in **App picks** + **Your own** chips;
  catalogue preview per topic chip; upload/paste/link **only** when Your own is
  selected; optional **Keep in my library**; Start gating until Source resolves.
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
| 8 | Taps Start | Navigates to `/practice?method=…` with `sourceId`, `topicId`, optional `supportRung` |
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

Reads `materialTopics`, catalogue Sources (`tags[]` includes topic `id` — same
ids as method chips), coverage service. Writes optional `learner` Source when
keep checked.

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
