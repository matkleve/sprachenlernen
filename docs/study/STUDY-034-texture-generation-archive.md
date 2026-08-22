# 34 · Texture generation attempts — archive and pause

<!-- id: STUDY-034 -->
<!-- type: reasoning -->
<!-- status: active -->
<!-- related: STUDY-030, STUDY-031, STUDY-032, STUDY-033, progression-theme-system -->

## Thesis

Between 2026-08-21 and 2026-08-22 the repo tried **four families** of wood
texture generation (CSS noise, live canvas, photo FFT, morphological cracks).
The **photo FFT path at native crack scale** produced the only owner-validated
near-match (`wood-01`). **Algorithmic canvas** was upgraded through ten tuned
variants but did not pass owner eye against weathered longitudinal plank photos.
**Owner decision 2026-08-22:** do not pursue texture synthesis further without
an explicit new GO. This chapter is the record so agents do not reopen dead paths.

## Evidence

### 1 · CSS `feTurbulence` skins (`app/progression-skins.css`)

**[D]** Nine chapter stage skins via stacked SVG filters and blend modes
([STUDY-029](STUDY-029-progressive-textures.md)). Fixed chromatic noise
(`feColorMatrix saturate=0`), px-scaled `StageFrame` displacement, dual ink pairs
for bench vs card.

**Outcome:** Useful for Library/Observatory direction; Workshop wood still
wrong. Hand-fitted four-layer measured recipe in
[`progression-theme-system.md`](../plans/progression-theme-system.md) § *Measured
wood recipe* — **superseded 2026-08-22** by FFT resynthesis.

### 2 · Growth-ring canvas (`lib/procedural-wood.ts`)

**[D]** Domain-warped `sin` rings + fibres (Texturize-style). Still referenced
from material-explorer copy; **not** the `/dev/wood-textures` contract.

**Outcome:** Wrong model for face-grain plank — owner corrected 2026-08-21
([STUDY-030](STUDY-030-procedural-wood-grain.md), [`TRAPS.md`](../TRAPS.md) §
Wood grain studies). Do not wire into progression.

### 3 · Layered horizontal canvas (`lib/wood-grain-ridges.ts`)

**[D]** Live resize-safe renderer for `/dev/wood-textures` ([`wood-texture-lab.md`](../specs/page/wood-texture-lab.md)).

| Iteration | Field model | Failure |
| --- | --- | --- |
| v1 | Pseudo-radial `ridgeFieldAt` | Arc / ring contours, zigzag columns |
| v2 | Y-periodic + X-warp, sin-heavy bands | Regular waves, “plank seams”, not shredded fibre |
| v3 | Fine striations on **X** (wrong axis) | Vertical brightness barcode |
| v4 | Y-axis fine fibre + morphological groove proxy + 10 tuned presets | Closer direction; owner stopped — not good enough vs `wood-01` patch |

**Shipped in code (dev only):** `WOOD_TUNED_VARIANT_COUNT = 10` presets in
`lib/wood-grain-tuned-variants.ts`; morphological blur-difference grooves;
`stableWarpAmount()`; tests for Y-dominant field and no vertical columns.

### 4 · Photo 2D FFT (`scripts/wood-grain-fourier-synthesis.py`)

**[D]** Anisotropic spectrum + Heeger–Bergen crack layer + directional rim +
albedo multiply ([STUDY-032](STUDY-032-photographic-wood-grain-synthesis.md)).

| Finding | Detail |
| --- | --- |
| Breakthrough | `FEATURE_SCALE` 9 → **1** — native crack scale; owner: *"so close"* on wood-01 |
| Hero cracks | Extracted `relu(blur−photo)` mask beats HB/morph for sharp fissures |
| Tiles | `design/progression/synthesized/wood-01…06_*.png`, patches, comparisons |
| Not done | `texture-metrics.mjs` vs full board; OKLCH ramp vs albedo multiply |

### 5 · Morphological crack masks (`STUDY-033`, `scripts/generate-crack-mask-tries.py`)

**[D]** Valley extraction on synthetic topography — horizontal-biased blur-difference,
grey closing/opening, top-hat thinning.

**Outcome:** Same ink budget as photo cracks but **blob geometry** (~8 components
× ~2200 px vs photo ~1500 × ~2 px). Metrics in `scripts/wood-crack-metrics.py`.
Useful for diagnosis; **not** production default.

### 6 · Landscape / layer demos (research scripts, not product)

`scripts/wood-landscape-layer-demo.py`, `scripts/weathered-plank-layer-demo.py`
— greyscale layer decompositions for algorithm comparison. Not wired to UI.

## Product consequences

- **Stop line:** No further texture synthesis work unless owner reopens with a
  specific target (board column, species patch, or live page).
- **Preferred asset path when wiring Workshop:** baked FFT tiles from
  `design/progression/synthesized/` (breakthrough wood-01 at minimum), not live
  canvas — see [`progression-theme-system.md`](../plans/progression-theme-system.md)
  T-PT0d.
- **Dev pages kept:** `/dev/wood-textures` (10 tuned + 4 board presets),
  `/dev/progression` CSS skins — reference only.
- **Measuring tools kept:** `scripts/texture-metrics.mjs`, `scripts/wood-crack-metrics.py`.

## What we reject (going forward without new GO)

| Path | Why |
| --- | --- |
| More algorithmic canvas tuning | Owner pause; FFT + extracted cracks already closer |
| Radial / ring height fields | Face-grain plank invariant |
| `feTurbulence` low-X frequency for wood | Vertical barcode ([`TRAPS.md`](../TRAPS.md)) |
| HB/morph as default crack generator | Blob stats vs photo fissures |
| Multi-species grid source photos | Seam contamination in FFT ([STUDY-032](STUDY-032-photographic-wood-grain-synthesis.md)) |

## Open questions (frozen until owner GO)

- Wire breakthrough `wood-01_final.png` into `/dev/progression` Workshop column 1
- Full-board `texture-metrics.mjs` run on all six synthesized patches
- Knot mechanism for wood-05/06
- OKLCH quantile ramp replacing albedo multiply

## Related

| Artifact | Role |
| --- | --- |
| [`design/progression/`](../../design/progression/) | Patches, synthesized tiles, comparisons |
| [`design/wood-grain-fourier/`](../../design/wood-grain-fourier/) | Earlier FFT iteration trail |
| `lib/wood-grain-ridges.ts` | Live canvas (dev lab) |
| `lib/wood-grain-tuned-variants.ts` | Ten tuned algorithmic presets |
| [`docs/diary/2026-08-22.md`](../diary/2026-08-22.md) | Session log + pause |
