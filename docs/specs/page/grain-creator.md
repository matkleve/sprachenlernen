# Grain creator — procedural horizontal wood graining

<!-- id: SPEC-page-grain-creator -->
<!-- use-case: UC-080 -->
<!-- status: active -->

A dev-facing page at `/dev/grain-creator` where a product owner tunes **only**
the horizontal wood-grain layers — macro band seams and micro fibre noise —
before copying values into `wood-textures.css` or progression skins.

Complements `/dev/wood-textures` (four fixed species) by exposing the knobs
behind those recipes. No lighting, bevel, or plank-base gradients — graining
only (STUDY-029 macro + micro stack).

## Scope

- **In:** live preview swatch; sliders and colour inputs for macro bands and
  micro fibres; four presets (raw planks, sanded bench, oiled timber, stock
  bar); copyable CSS snippet; helpers in `lib/grain-creator.ts`.
- **Out:** full material stack; wiring to learner data; persistence; navigation
  in the app shell. Account required: **no** — `/dev/*` is public.

## Behavior

| # | User action | System response |
| --- | --- | --- |
| 1 | Opens `/dev/grain-creator` | Preview at raw-planks preset; controls populated |
| 2 | Moves a macro or fibre slider | Preview updates immediately |
| 3 | Selects a preset chip | Controls and preview jump to that species recipe |
| 4 | Clicks copy CSS | Snippet with current values is on the clipboard |

## Acceptance criteria

- [ ] Given a signed-out visitor, when `/dev/grain-creator` is requested, then
      it renders without redirecting to sign-in.
- [ ] Given the page, when it loads, then a grain preview and at least one
      range control are visible.
- [ ] Given the raw-planks preset, when selected, then `seamDarkOpacity` exceeds
      the oiled-timber preset's value.
- [ ] Given any control change, when the preview re-renders, then the fibre
      layer still uses horizontal anisotropic turbulence (`freqY` > `freqX`).
- [ ] Given copy CSS, when clicked, then the clipboard contains a
      `repeating-linear-gradient(90deg` fragment and a `feTurbulence` data-URI.

## Check

`npm test -- grain-creator`
