# Progression explorer — one control, every stage of the interface

<!-- id: SPEC-page-progression-explorer -->
<!-- use-case: UC-080 -->
<!-- status: active -->

A dev-facing page at `/dev/progression` where a product owner moves one slider
through eight stages and watches the app's real surfaces change. Serves
[UC-080](../../use-cases/UC-080-see-how-the-interface-changes-with-progress.md).

**Reuse: `Button`, `Field`, `Input`, `Chip`, `FilterPill`, `GradeButton`,
`SkillTierBadge`** — the preview is built from the shipped primitives, not from
lookalikes. That is the whole point: a mock made of bespoke divs would answer a
question nobody asked.

## The model, in two layers

The two layers exist separately because they cost differently. Collapsing them
is the mistake this spec is written to prevent.

| Layer | What it is | How many | What it may change |
| --- | --- | --- | --- |
| **Chapter** | A full token set — colours, radii, font pairing | 3 | Everything a theme may change |
| **Stage** | A decorative overlay **on top of** the current chapter | 8 | Texture, depth, ornament — nothing else |

A stage must never redefine `ink`, `muted`, `canvas` or `surface`. Those carry
text contrast, and `check:contrast` validates **chapters** only. The moment a
stage touches them, the gate's guarantee is void and the palette count goes
from six to sixteen. Stages are therefore restricted to properties that cannot
carry text: glow, grain, bevel, rule opacity.

Chapters map to stages: Workshop 1–3, Library 4–6, Observatory 7–8.

## Scope

- **In:** the stage slider (1–8); a chapter label that updates with the stage; a
  preview containing header bar, method card with a skill-tier badge, review
  card with grade buttons, nav pills, buttons, and a field; chapter and stage
  data in `data/design-themes/progression.json`.
- **Out:** any coupling to real learner data; persistence of any kind; changes
  to the shipped theme or to `data/design-themes/presets.json`; a navigation
  entry in the app shell. Account required: **no** — `/dev/*` is public, as
  `/dev/design` and `/dev/brand` already are.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/dev/progression` | Preview renders at stage 1, chapter Workshop |
| 2 | Moves the slider to 5 | Preview re-renders in the Library chapter with stage 5's overlay; the chapter label reads Library |
| 3 | Crosses a chapter boundary (3→4, 6→7) | Colours, radii and heading font change — the transition is meant to be visible as a moment |
| 4 | Moves within a chapter (4→5) | Only grain, bevel, rule and glow change; colours hold |
| 5 | Reads the preview | Sees the app's real components, not stand-ins |

## States

| State | Trigger | Effect | Terminal? |
| --- | --- | --- | --- |
| `browsing` | initial | Stage 1, Workshop | no |
| `adjusting` | slider moved | Preview re-scopes to the new chapter + stage | no |

Loading, error and empty do not apply — chapters and stages are static data.

## Data

| Field | Source | Owner |
| --- | --- | --- |
| Chapter tokens | `data/design-themes/progression.json` | build-time data |
| Stage overlays | same file | build-time data |
| Selected stage | React state | client, not persisted |

## Acceptance criteria

- [ ] Given a signed-out visitor, when `/dev/progression` is requested, then it
      renders without redirecting to sign-in.
- [ ] Given any stage 1–8, when `chapterForStage` is asked, then it returns
      Workshop for 1–3, Library for 4–6, and Observatory for 7–8.
- [ ] Given two stages in the **same** chapter, when their scope styles are
      compared, then `--color-ink`, `--color-canvas`, `--color-surface` and
      `--color-muted` are identical — a stage never moves a contrast-bearing
      token.
- [ ] Given two stages in the same chapter, when compared, then at least one
      decorative value (glow, grain, bevel, rule) differs — every step is
      perceptible in the output, whatever the eye later decides.
- [ ] Given stage 8 and stage 1, when compared, then the chapter differs and so
      does the token set.
- [ ] Given the slider, when it is operated by keyboard, then it has an
      accessible name and a visible focus state.

## Check

`npm test -- progression`
