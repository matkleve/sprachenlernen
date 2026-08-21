# 30 · Procedural wood grain: what makes it read as wood, and what breaks at edges

<!-- id: STUDY-030 -->
<!-- type: reasoning -->
<!-- status: active -->
<!-- related: STUDY-028, STUDY-029, wood-texture-lab -->

## Thesis

Wood grain reads as wood because of three independent, layered signals —
directional fibre streaks, irregular concentric rings, and non-periodic
earlywood/latewood banding — and the exact defect flagged twice on
`/dev/wood-textures` (evenly repeating vertical bands) is what happens when any
one of those signals is approximated with a **fixed-period** pattern instead
of **domain-warped noise**. The same warp that makes a plank's face read as
wood is also what must stay face-plane-only at a rounded corner, or the corner
reads as the end of a dowel instead of a rounded-off plank.

## Evidence

Findings marked `[A]`–`[D]`. Sources in
[`STUDY-sources.md`](STUDY-sources.md) § *Procedural wood grain*.

### Real wood grain is three signals, not one

1. **Growth rings** — concentric structures from the tree's cross-section.
   **[B]** Not perfectly circular: off-centre from uneven sun/soil exposure
   (Lumitree). On a **face-grain** plank (cut roughly parallel to the rings —
   the common flat board) you see only the sliver of a ring's curve that
   crosses the cut plane, so rings read as long streaks, not circles. On
   **end grain** (a cut across the fibres) the same rings show as full
   concentric circles — the "tree stump" look. This face/end distinction is
   the load-bearing fact for the edge question below.
2. **Fibre lines** — fine longitudinal streaks from cell structure, running
   parallel to the grain direction, layered *on top of* the rings, not
   instead of them. **[B]** Produced with **anisotropic** noise: a very
   different frequency on the two axes (CSS-Tricks; the `grain_noise` /
   `warp_noise` pair in the `symbios-texture` wainscoting generator).
3. **Earlywood/latewood banding** — within one ring, a light fast-growth band
   and a darker dense band. **[B]** Wood shaders drive this with a colour
   ramp over the ring's sine value, not a flat two-tone alternation (OTOY
   Octane's woodgrain deep-dive; Foundry Modo's Wood procedural docs — `Gain`
   and a gradient control the earlywood→latewood transition sharpness).

None of the three is periodic in the naive sense our first swatches used.
Ring spacing varies year to year (a drought year grows a thinner ring), so the
"period" of the pattern must itself vary — which noise-distorted rings give
for free and a fixed-pixel `repeating-linear-gradient` cannot.

### The one mistake every wood-shader writeup repeats: rings and fibres must covariate

**[A]** The most repeated lesson across shader/Blender forums (Blender
Artists, *"Procedural wood — be honest, what do you think?"*, 2026): generate
the ring pattern and the fine-grain noise from **two independent** coordinate
sources and the wood looks fake, because real fibre direction always bends
together with ring curvature. The fix is **domain warping** (Iquilez,
*Domain warping*): distort one coordinate space once, `g(p) = p + h(p)`, then
evaluate every layer — rings **and** fibres — at `g(p)`, never at the
original `p`.

```glsl
vec2 warpedP = p + fbm(p * warpFreq) * warpStrength;
float rings  = sin(length(warpedP) * ringFreq);                       // growth rings
float fibre  = fbm(warpedP * vec2(fibreFreqAlong, fibreFreqAcross));   // grain lines
```

Both lines read `warpedP` — that shared input is the covariance. Two
independent `fbm(p)` calls at different frequencies is what makes rings and
fibres look like two unrelated overlaid patterns — visually close to what our
v1/v2 attempt produced: colour bands with no relationship to the noise sitting
on top of them.

### Anisotropy is the whole trick, and its direction is exactly what we had backwards

**[A]** A texture reads as "grain running left to right" because the noise is
stretched far more on one axis than the other *before* the ring/fibre step
(CSS-Tricks *Creating Patterns With SVG Filters*: `baseFrequency="0.1 0.01"` →
stretched noise → directional wood grain; texturize.app's generator note: "the
x-axis has been multiplied by a large factor — that stretching is what turns
round noise clumps into elongated streaks parallel to the grain direction").
Two things follow, and both were inverted in the version the owner caught:

- **The high-frequency axis must be the grain axis**, not the one across it.
  Our SVG turbulence used `baseFrequency='0.02 0.45'` — low frequency along X,
  high along Y. That means the pattern changes *slowly* left-to-right and
  *fast* top-to-bottom: a pattern that is nearly constant across the width and
  varies down the height is exactly a **vertical stripe**. For grain running
  left to right, the pairing must invert: high frequency along X, low across
  it.
- **Uniform tone with continuous micro-variation, not colour steps.**
  `repeating-linear-gradient(90deg, colorA colorB colorA …)` is a periodic
  step function along X — every wavelength is a hard colour change on a plane
  perpendicular to the repeat axis, which is a vertical bar when the repeat
  axis is horizontal. Real left-right variation in wood is continuous and
  irregular (signals 1–3 above), never stepped.

### Knots bend the grain around them; they do not tile

**[A]** Knots are a small number of Worley/Voronoi cells (sparse, not a tiling
field) whose distance field both darkens local colour and feeds back into the
domain warp, so nearby rings and fibres bow around the knot rather than
running straight through it (Blender Artists thread; OTOY deep-dive;
AITextured's crosscut-with-knots description: "minute variations around each
knot"). **[C]** For a UI-scale swatch, a knot is optional ornament — the
ranked signals for "reads as wood" are (1) fibre direction, (2) ring/banding
irregularity, (3) knots.

### Edges: face grain, edge grain, end grain — and what a rounded corner must not become

**[B]** Woodworking sources (Jeff Mack Supply; The Knotty Lumber Co.) name
three cuts, each with a different visible pattern:

| Cut | What you see | Where it would apply on a UI swatch |
| --- | --- | --- |
| Face grain | Wide, flowing streaks — the plank's main surface | The swatch face — what our cards show today |
| Edge grain | Straighter, narrower, more linear streaks — the board's thin side | A card's vertical edge, if ever rendered in profile |
| End grain | Full concentric rings, checkerboard-like | A cut end — e.g. a pill shape's rounded cap, if it were a real dowel end |

For a flat rectangular or pill swatch rendered face-on, **only face grain
applies** — end-grain rings should never appear on a flat face. **[A]** The
Blender *"Weird texture warping on deformed cube"* thread documents the
concrete failure mode: applying isotropic 3D noise across a whole curved
surface makes the same rings reappear, rotated, at a rounded edge — because
the noise is evaluated in a coordinate space that rotates with the surface
normal instead of staying fixed to one face plane.

**Practical fix for CSS/SVG:** keep grain as a `background-image` fill on the
same element that carries `border-radius`, rather than a per-corner SVG asset
or a filter recomputed per curved-surface normal. The radius then **clips**
the fill; it never rotates the grain. That matches a real plank whose corner
was rounded off with a router — straight grain, corner clipped — instead of
the end of a dowel. This is the same limitation already on record in
[STUDY-028](STUDY-028-irregular-borders.md): `border-image` and per-corner SVG
assets ignore `border-radius` (MDN), so a bordered-frame implementation of
grain would desynchronize direction from the rounded corner exactly where the
owner's screenshot showed the defect.

### Interrupted ridges: a warp can be too fast for its own canvas

**[D]** Once the CSS-only line stack became a canvas-warped ridge field
(`lib/wood-grain-ridges.ts`), the owner flagged a second, more specific
defect: on the "Raw planks" swatch, the hills and valleys did not pull
through continuously left to right — they looked interrupted, as if a
ridge's smooth curve suddenly kinked or dissolved into a tangle of tight
zigzags for a short stretch before smoothing out again.

Two independent causes were found, both about how fast the domain warp is
allowed to change relative to the ridge grid it is bending:

1. **The warp's *vertical* input changed too fast within one ridge's own
   height.** It was sampled as `y / height`, so across one ridge-height
   band the noise's y-coordinate advanced by a large fraction of a full
   noise wavelength — meaning the same ridge sampled a visibly different
   warp near its own top edge vs its own bottom edge, and the curve folded
   on itself instead of reading as one continuous bend. Fix: sample the
   warp's y-input in *ridge units* (`y / ridgeStep`), scaled down further by
   a small constant, so one ridge-height step moves the noise field by only
   a sliver — while ridges several steps apart still drift apart enough to
   merge or split.
2. **The warp's *horizontal* rate of change could exceed one ridge-step per
   warp wavelength.** The ridge traced at a fixed row is
   `y + warp(x, y)`; across one warp wavelength (`width / warpFrequency`
   pixels) the offset can swing by up to `2 × warpAmount × ridgeStep`. Once
   that swing approaches the wavelength itself, `y + warp(x, y)` is no
   longer single-valued as x increases — the traced curve doubles back on
   itself, which is exactly the "tight zigzag" tangle in the screenshot.
   The "Raw planks" preset had the highest `warpAmount × warpFrequency`
   product of the four (`0.9 × 3.2 = 2.88`), and the effect was strongest at
   the narrowest rendered width and highest zoom — both increase how much of
   the true curve's instability gets sampled instead of blurred away. Fix:
   `stableWarpAmount()` caps `warpAmount` per render so
   `warpAmount × warpFrequency × ridgeStep / width` stays under a fixed
   safety margin, regardless of the card's actual pixel size on screen.

Both fixes are regression-tested directly on the warp function
(`lib/wood-grain-ridges.test.ts`) rather than by inspecting rendered pixels,
because pixel-level "did it look broken" checks are exactly the kind of
fine detail a screenshot diff or OCR-based review misses — the owner's own
observation earlier in this study.

### Owner-requested sources (2026-08-21): Wilkie distortion field, not warped stripes

**[A]** The owner supplied two references and flagged that prior canvas attempts
did not follow published wood algorithms:

1. **Hafidi & Wilkie (CGF 2025, DOI 10.1111/cgf.70066)** — *From Words to Wood*.
   Procedural model with growth rings, vessels, rays, knots, figure; novel
   **brushiness distortion**, **influence points** (repulsive displacement on
   rings), and per-feature control. Builds on the Liu/Wilkie cylindrical
   solid-wood lineage ([LDHM16]; see also Nindel et al. arXiv:2302.01820).
2. **jsabbott (Olde Tinkerer Studio / ArtStation)** — practical Blender shader
   tutorial: **domain warp** (noise vector → Musgrave/noise vector), anisotropic
   mapping (high X stretch, low Y), layered color ramps and bump.

**[A]** The load-bearing algorithm across Wilkie/Liu/Nindel is not `sin(y +
f(x))` warped stripes. It is:

- An idealized **growth-ring coordinate** (ring age / radial distance in tree
  space).
- A **spatially varying distortion field** `f(p)` applied *before* sampling
  that coordinate — radial distortion `mr(p)` bends ring shapes (blister /
  island bulges); tangential distortion `mt(p)` adds figure along the grain
  (Cornell procedural wood textures paper; Liu et al. [LDHM16]).
- **Influence points** (Hafidi 2025) as localized repulsive terms on the
  distortion field.

**[D]** Owner correction: hills and valleys on a landscape vary in **both** x
and y — localized islands, not stripes whose only motion is sliding on y as x
changes. That matches `mr(x,y)` and `mt(x,y)` on the board face, not a 1D
warp of horizontal sine lines.

**Implementation (2026-08-21):** `lib/wood-grain-ridges.ts` now uses
`ringAgeAt(x,y) = base_y + mr(x,y) + mt(x,y) + influence(x,y)` with multiband
fbm distortion (4 bands, per Wilkie) and seeded influence points. Ridges are
contours of `sin(ringAge × 2π)` with raking light on slope. This replaces
`ridgePhaseAt` / `warpOffsetPx` sine-warp experiments.

### Tileability without visible seams

**[B]** A texture that repeats via `background-size` must be seamless at the
tile boundary; naive `fbm(x, y)` or `sin(distance)` rings do **not**
guarantee `value(x=0) == value(x=width)`. **[A]** The fix used across every
tiling-noise writeup here (Lumitree; `symbios-texture`;
`tuxalin/procedural-tileable-shaders`): map the 2D tile coordinate to a 4D
torus — `(cos 2πu, sin 2πu, cos 2πv, sin 2πv) · frequency` — and sample 4D
noise there. Because `cos(0) = cos(2π)` and `sin(0) = sin(2π)`, the two tile
edges are mathematically identical. SVG's own `stitchTiles="stitch"`
attribute (present in our now-removed `feTurbulence` grain) is the SVG-native
version of the same guarantee, scoped to one rectangular tile.

## Product consequences

For `/dev/wood-textures` specifically:

The current **CSS-only horizontal line stack** is a cheap, correct-direction
approximation of signal 2 (fibre lines) only — it has no irregular rings
(signal 1) and no banding gradient (signal 3), and it is strictly periodic,
which real grain never is. That is an acceptable stand-in for a page whose
job is *labelling which species goes where*, not final art — but it should
not be copied verbatim into a learner-facing surface without adding the
noise-based irregularity above.

If irregularity is ever wanted here or in the progression skins
([STUDY-029](STUDY-029-progressive-textures.md)), the correct next step is
domain-warped anisotropic noise, not a return to SVG `feTurbulence` at the
frequency pairing this page shipped with originally (`0.02 0.45`,
low-X/high-Y) — that pairing is what produced the vertical-stripe bug twice.
Any noise-based revision must invert the frequency pairing and be checked at
zoom before shipping, since this is exactly the class of defect automated
review and a normal screenshot both missed.

Rounded and pill-shaped swatches (Stock bar) must keep grain in
`background-image` space tied to the flat face, never recomputed per curved
surface — so a rounded corner reads as "rounded off", not "a different grain
angle" or an accidental end-grain artifact.

Any future tiling background taller than one `background-size` tile needs the
seam check above; today's swatches are single-tile height, so this has not
bitten us yet — but it will the moment a card grows past one tile.

## What we reject

| Alternative | Why |
| --- | --- |
| Fixed-period `repeating-linear-gradient` colour bands as the sole grain signal | Periodic by construction; real ring spacing varies — the exact defect flagged twice |
| SVG `feTurbulence` with low-X/high-Y `baseFrequency` for "horizontal" grain | Low frequency along the visible axis reads as slow variation along it and fast variation across it — vertical stripes, backwards from intent |
| Independent noise calls for rings and fine grain | Documented anti-pattern — the two patterns visually "drift apart" instead of covariating like real wood |
| Isotropic/3D noise applied uniformly across a rounded corner or pill cap | Produces end-grain-like rings at a corner that should read as a rounded-off face-grain plank |
| Photographic/PBR tile per species as the only path | Valid for final ship art ([STUDY-029](STUDY-029-progressive-textures.md) already allows optional tiles in `public/design/progression/`), but reintroduces the raster-asset-per-species problem for a page whose job is labelling, not final art |

Shared rejection catalogue: [STUDY-009](STUDY-009-antipatterns.md).

## Open questions

- Does `/dev/wood-textures` need noise-based irregularity at all, or is the
  CSS line-stack "good enough to mark species" for its stated job? → owner
  call once the current fix is reviewed live.
- If irregularity is added, is it worth a small shared, build-time-cached
  procedural grain (canvas-rendered, warped, seam-checked, exported once as a
  data URL) rather than live SVG filters, given the seam and
  frequency-direction pitfalls above? → implementation detail, not decided
  here.
- Should knots ever appear on a UI swatch, or are they explicitly out of scope
  for a "mark the species" workbench? → product owner, if/when this graduates
  past dev tooling.
- Does any learner-facing surface ever need real wood grain, or does the
  "material skin" stay abstract as already scoped in
  [`progression-explorer.md`](../specs/page/progression-explorer.md)'s Out
  list? → no change proposed here; this study serves the dev workbench and
  any future progression-skin work only.

## Related

| Doc | Link |
| --- | --- |
| Progressive textures (grain, lighting, blend stacks) | [STUDY-029](STUDY-029-progressive-textures.md) |
| Irregular borders (edges as a separate decorative layer) | [STUDY-028](STUDY-028-irregular-borders.md) |
| Visual design constraints | [STUDY-020](STUDY-020-visual-design.md) |
| Dev workbench this study explains | `/dev/wood-textures`, [`specs/page/wood-texture-lab.md`](../specs/page/wood-texture-lab.md) |
| Web sources for this chapter | [STUDY-sources](STUDY-sources.md) § *Procedural wood grain* |
