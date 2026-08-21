# Grain creator — procedural horizontal wood graining

<!-- id: SPEC-page-grain-creator -->
<!-- use-case: UC-080 -->
<!-- status: active -->

A dev-facing page at `/dev/grain-creator` where a product owner tunes procedural
wood graining — **fBm-style macro hills/valleys** (game heightmap model) plus
anisotropic micro fibre. No `repeating-linear-gradient` stripes.

Complements `/dev/wood-textures` by exposing knobs before wiring skins. No
lighting or bevel — graining only (STUDY-029).

## Model

Same stack as procedural terrain ([Red Blob Games — terrain from
noise](https://www.redblobgames.com/maps/terrain-from-noise/)):

1. **Macro:** low-frequency `feTurbulence` (`fractalNoise`, few octaves) =
   heightmap. `filter: contrast()` maps lows → dark valleys, highs → ridges;
   `multiply` tints the base.
2. **Micro:** higher-frequency anisotropic noise = detail octaves on the surface.

**Sizing:** default `stretch` — one noise field scaled to the preview area (no tile
seam). `tile` repeats a bitmap; even with `stitchTiles`, high contrast can expose
a straight cut. Games avoid this by sampling noise per pixel in a shader; CSS
cannot.

**Valley abruptness:** `feComponentTransfer` gamma on macro noise (terrain
power-curve) plus CSS contrast — reference raw planks have sharp valley walls.

## Scope

- **In:** side-by-side reference crop + generated preview; macro + micro noise
  controls (freq, octaves, seed, gamma, contrast, sizing stretch/tile); four
  presets; copyable CSS; `lib/grain-creator.ts`.
- **Out:** full material stack; learner wiring; persistence; shell nav. Public
  `/dev/*`.

## Acceptance criteria

- [ ] Given a signed-out visitor, when `/dev/grain-creator` is requested, then
      it renders without redirecting to sign-in.
- [ ] Given the page, when it loads, then preview and at least one range control
      are visible.
- [ ] Given the raw-planks preset, when selected, then `macroContrast` exceeds
      stock-bar's value.
- [ ] Given copy CSS, when clicked, then the snippet contains `feTurbulence` and
      does **not** contain `repeating-linear-gradient`.
- [ ] Given default params, when CSS is generated, then macro and micro use
      `background-repeat: no-repeat` and `background-size: 100% 100%`.
- [ ] Given the page, when reference crop exists at
      `public/design/grain-creator/workshop-1-raw-planks.webp`, then it renders
      beside the generated preview.

## Check

`npm test -- grain-creator`
