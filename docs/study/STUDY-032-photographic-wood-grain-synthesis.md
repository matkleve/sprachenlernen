# 32 · Photographic wood-grain synthesis via 2D FFT

<!-- id: STUDY-032 -->
<!-- type: reasoning -->
<!-- status: active -->
<!-- related: STUDY-030, STUDY-031, wood-texture-lab, progression-reference-board -->

## Thesis

For producing wood texture **source material**, 2D-FFT spectral analysis of a
real photo — synthesized back into a tile via
`scripts/wood-grain-fourier-synthesis.py` — is the owner's chosen direction:
`docs/plans/progression-theme-system.md` § *Measured wood recipe* records it
as **stopped 2026-08-22 in favour of 2-D FFT resynthesis**, independently of
this chapter. This doc is a candidate implementation of that already-adopted
direction, not a separate proposal. It has **not yet been measured against
`design/progression/reference-board.png`** with `scripts/texture-metrics.mjs`
([STUDY-031](STUDY-031-texture-metrics.md)) — until that happens, treat it as
a working pipeline proven on placeholder photos, not a validated match to the
board. It does not replace the live-redrawing procedural canvas
(`lib/wood-grain-ridges.ts`) that `/dev/wood-textures` depends on for its
resize behavior — a baked tile and a live renderer solve different problems.

## Evidence

**[D]** A single wood photo's luminance is a height field: light = ridge, dark
= valley. Its 2D FFT gives a real, measured spectrum — not a guessed one.

**[D]** Radially-averaging that spectrum before resynthesizing throws away
**direction** — the filter becomes rotationally symmetric, so no amount of
noise shaping can produce directional streaks. Keeping the real (smoothed,
not radially-collapsed) 2D magnitude spectrum as the filter is what makes
synthesized grain run the photo's actual direction instead of reading as
isotropic mottled noise.

**[D]** Spectrum-matched synthesis alone (filter white noise, keep the
target magnitude) only controls **pairwise correlation** — the result is a
Gaussian random field. Real defects (cracks, checking) are sparse and
heavy-tailed: mostly none, with rare strong dark spikes. A Gaussian field
with the right spectrum still comes out as diffuse haze, not distinct lines,
because it has the wrong **marginal distribution** (histogram), not the wrong
spectrum. Fix used here: **Heeger–Bergen alternating projection** — repeat
(a) force target spectrum magnitude, keep current phase, (b) histogram-match
to the real defect layer's pixel values. Confirmed by direct comparison:
naive spectrum-only synthesis of an isolated crack layer produced uniform
fine graininess; the same layer after histogram matching produced actual
sparse dark scratch lines, with the histogram plot showing the naive version
as a symmetric bell curve versus the real "spike at zero, long tail" shape.

**[D] — scoped against STUDY-031's finding 11.** That chapter found
per-channel RGB histogram matching decorrelates R/G/B and turns wood pink,
and fixed it by separating structure from colour: sum grayscale layers, then
apply one OKLCH ramp solved from the reference's lightness quantiles. This
pipeline's histogram matching is applied to a **single grayscale defect
layer** only, never to R/G/B channels independently, and structure/colour are
already separated the same way in spirit: a grayscale shading composite,
multiplied onto a real-photo colour field (`albedo × shading / 128`). That
multiply is *not* the same fix, though — it does not hold hue/chroma by
construction the way an OKLCH-quantile ramp does, it only approximates it by
scaling R, G, B together. Adopting STUDY-031's exact ramp-from-quantiles
technique in place of the albedo multiply is the likely next step if measured
colour drifts.

**[D]** Feature size is controllable independently of the recipe's shape via
the **Fourier scaling theorem** (`f(kx,ky) ↔ (1/k²)F(u/k,v/k)`): zooming the
frequency-domain filter about its DC center resizes the real-space features
it produces, without touching pixels. Because histogram matching fixes the
total "ink" budget, making individual features bigger (`FEATURE_SCALE`) also
sparsens their count — the same budget spread over fewer, larger features.

**[D]** A raised/frayed fiber lip next to a real crack is not reproducible by
an isotropic filter (blur-difference halos come out symmetric on both sides).
A **directional derivative** (vertical gradient of the crack field) is
required to bias the highlight to one side; a thresholded low-frequency noise
mask keeps it from running a crack's full length, matching how only the
larger/deeper splits actually show a lit lip in a real photo.

**[D]** Source photo generation: **one wood species per image**, not a
multi-species grid. A grid splits the generator's resolution N ways and
creates hard color-discontinuity seams between adjacent species that inject
spurious high-frequency energy into the FFT even without a drawn divider
line. A dedicated single-wood image gives the entire resolution budget to one
species and has no internal seam to crop away from. STUDY-031 records the
same finding independently for the reference board itself: **the bench has
no plank seams** — what reads as one in a crop is the design's own accent
rule or a button edge, not the material.

## Product consequences

- `scripts/wood-grain-fourier-synthesis.py` is the canonical tool for turning
  a reference wood photo into a source tile. Point it at a new photo, get a
  shading map and a colorized tile; tuned parameters live at the top of the
  file. **All tuning to date was done against placeholder (non-board) photos**
  — before wiring a result into `/dev/progression`, run it against
  `design/progression/reference-board.png` and check it with
  `scripts/texture-metrics.mjs`, same as any other material candidate.
- Photo generation prompt: single wood, max resolution, flat/uniform
  lighting, zero perspective, PNG (not JPEG — its block compression injects
  a spurious spike right in the frequency range the crack layer needs).
  Distressed/reclaimed character is a deliberate choice, not a default to
  strip out.
- Output is a fixed-resolution raster tile — use it as a CSS `background-image`
  tile or crop into `design/progression/`, per the "tile" implementation
  choice already permitted by
  [`progression-reference-board.md`](../specs/feature/progression-reference-board.md).
  It is not a live-redrawing renderer; `/dev/wood-textures`' resize-on-resize
  acceptance criterion stays served by `lib/wood-grain-ridges.ts` until an
  agent explicitly re-specs that page to consume baked tiles instead.

## What we reject

| Alternative | Why |
| --- | --- |
| Radially-averaged spectrum as the synthesis filter | Collapses direction to isotropic noise — no streaks survive |
| Spectrum-matching alone for sparse defects (cracks, knots) | Gaussian marginal distribution — diffuse haze, not lines; needs histogram matching too |
| Per-channel RGB histogram matching for colour | STUDY-031 finding 11 — decorrelates channels, turns wood pink; this pipeline histogram-matches one grayscale layer instead |
| Symmetric (blur-difference) rim highlight | Real fiber-lip highlighting is one-sided; needs a directional gradient |
| Multi-species grid source photos | Splits resolution N ways; seams inject spurious FFT energy even with no drawn divider |
| Calling this validated before measurement | Tuned on placeholder photos only — `scripts/texture-metrics.mjs` against the real board hasn't run yet |
| Treating this study as the implementation of `/dev/wood-textures`'s resize behavior | That page's tested contract is the live canvas renderer — see [STUDY-030](STUDY-030-procedural-wood-grain.md) and [`wood-texture-lab.md`](../specs/page/wood-texture-lab.md) |

## Open questions

- Run `scripts/texture-metrics.mjs` against `design/progression/reference-board.png`
  once a photo of the actual board's wood (or a close match) is analyzed —
  this is the real gate, not eyeballing placeholder output.
- Whether the albedo-multiply colorize should be replaced with STUDY-031's
  OKLCH-ramp-from-quantiles method for exact hue/chroma control.
- Whether any live page should be re-specced to consume baked FFT-synthesized
  tiles instead of (or blended with) the procedural canvas — no change
  proposed here; would need its own spec update.
- Reproducing a knot as a discrete feature needs a separate mechanism (domain
  warping the base grain's sampling coordinates around the knot center, plus
  its own small radial-ring stamp) — not built yet, noted for a future pass.

## Related

| Doc | Role |
| --- | --- |
| [STUDY-030](STUDY-030-procedural-wood-grain.md) | The live-renderer counterpart — layered horizontal fibres, resize-safe |
| [STUDY-031](STUDY-031-texture-metrics.md) | The measuring apparatus this pipeline still needs to run through; also the source of the histogram-matching pink-wood finding this doc scopes against |
| [`wood-texture-lab.md`](../specs/page/wood-texture-lab.md) | Build contract for `/dev/wood-textures` (unaffected by this study) |
| [`progression-reference-board.md`](../specs/feature/progression-reference-board.md) | Visual target; permits "tile" as an implementation choice |
| [`docs/plans/progression-theme-system.md`](../plans/progression-theme-system.md) | § *Measured wood recipe* — the owner decision this pipeline implements |
| `scripts/wood-grain-fourier-synthesis.py` | The implementation |
