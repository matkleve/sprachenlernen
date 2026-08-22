# Material explorer — nine recipes, one geometry

<!-- id: SPEC-page-material-explorer -->
<!-- use-case: UC-080 -->
<!-- status: active -->

A dev-facing page at `/dev/materials` where a product owner inspects the
**material stack** — base fill, texture, edge, highlight, contact shadow, and
optional environmental light — applied to the same card + input + button
geometry across nine stages. Complements `/dev/progression` (full app preview)
by isolating the PBR-style material layer the progression system is built from.

**Reuse: none for the material primitives** — `.material-card`, `.material-input`,
and `.material-button` are dev-only stand-ins with identical geometry; only the
material tokens change. That is the point: prove Workshop 1→2→3 feels like the
same bench getting better, not three different designs.

## The model

Each stage is a **material recipe**, not a skin swap:

| Layer | CSS |
| --- | --- |
| Base fill | `background` on the element |
| Texture | `::before` with `mix-blend-mode: multiply` |
| Edge / border | `border` |
| Highlight | `::after` with top gradient |
| Contact shadow | `box-shadow` |
| Environmental light | scene-level radial gradients / stars |

Chapters map to stages: Workshop 1–3, Library 4–6, Observatory 7–9.

Numeric knobs (`roughness`, `grain`, `radius`, `specular`) are exposed in the
recipe table so a stage change is auditable, not magical.

## Scope

- **In:** stage slider (1–9); recipe table for the selected stage; one preview
  (card + input + button) at the selected stage; a Workshop 1–3 comparison row
  (same geometry, three material layers side by side); a **rough → fine guide**
  with knob bars for Workshop 1–3 and a nine-stage grid grouped by chapter;
  chapter label; material recipe data in `lib/material-recipes.ts`; CSS in
  `app/material-system.css`.
- **Out:** coupling to learner data; persistence; changes to shipped theme or
  `/dev/progression`; navigation entry in the app shell. Account required:
  **no** — `/dev/*` is public.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/dev/materials` | Preview at stage 1; Workshop comparison row visible |
| 2 | Moves slider to 3 | Preview re-renders with oiled-workshop material; recipe table updates |
| 3 | Reads Workshop row | Three identical layouts at stages 1, 2, 3 — only material differs |
| 4 | Moves slider to 8 | Observatory stars appear; brass edge highlights intensify |

## States

| State | Trigger | Effect | Terminal? |
| --- | --- | --- | --- |
| `browsing` | initial | Stage 1, Workshop | no |
| `adjusting` | slider moved | Preview + recipe table re-scope | no |

## Data

| Field | Source | Owner |
| --- | --- | --- |
| Material recipes | `lib/material-recipes.ts` | build-time data |
| Selected stage | React state | client, not persisted |

## Acceptance criteria

- [ ] Given a signed-out visitor, when `/dev/materials` is requested, then it
      renders without redirecting to sign-in.
- [ ] Given any stage 1–9, when `chapterForMaterialStage` is asked, then it
      returns Workshop for 1–3, Library for 4–6, and Observatory for 7–9.
- [ ] Given stages 1 and 2 in the Workshop comparison row, when compared, then
      geometry (card height, input width, button size) is identical and at least
      one material token (`--material-grain`, `--material-radius`, or
      `--material-roughness`) differs.
- [ ] Given stage 1, when the preview renders, then `--material-roughness` is
      greater than stage 3's value — raw is rougher than oiled.
- [ ] Given stages 1 and 3, when grain is compared, then stage 1's value exceeds
      stage 3's — refinement reduces visible texture, not increases it.
- [ ] Given stage 9, when the preview renders, then environmental star elements
      are present and `--material-specular` exceeds stage 7's value.
- [ ] Given the slider, when operated by keyboard, then it has an accessible
      name and a visible focus state.

## Check

`npm test -- material-recipes`
