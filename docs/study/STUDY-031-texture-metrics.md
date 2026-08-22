# 31 · Texture metrics: measuring whether a material looks right

<!-- id: STUDY-031 -->
<!-- type: reasoning -->
<!-- status: active -->
<!-- related: STUDY-028, STUDY-029, STUDY-030, progression-explorer -->

## Thesis

Judging "does this look like wood" from a screenshot is the weakest step when an
agent iterates on a procedural material; measuring the image is the strong one.
A small set of image statistics — tone, colour, orientation, scale — turns that
judgement into a diff and makes the next parameter change obvious instead of a
guess. **They are a diagnostic, not a target.** Every one of them can be
satisfied by something that looks worse, and this doc spends as much space on
how they mislead as on what they measure, because the failure modes were all hit
in practice while building them.

What a given material should *look* like is not this doc's call.
[STUDY-030](STUDY-030-procedural-wood-grain.md) owns that for wood — horizontal
fibre layers, no growth rings — and the specs and live code own the build
contract. This doc only supplies the measuring tape.

`scripts/texture-metrics.mjs` implements them:

```
node scripts/texture-metrics.mjs reference.png candidate.png [more.png ...]
```

## Evidence

Findings below come from building Workshop's wood against a crop of the design
board, over roughly a dozen measured iterations.

### What the numbers are

| Metric | Reads | Catches |
| --- | --- | --- |
| `tone` | median OKLab lightness | "too dark" / "too light" — the single most common miss |
| `contrast` | p95 − p5 lightness | flat, washed, or over-crushed surfaces |
| `chroma` | mean OKLab chroma | "too grey" / "too candy" |
| `lightRange` | lightness spread, p80 quintile − p20 quintile | no light grain: darks and lights sitting too close |
| `chromaByL` | mean chroma per lightness quintile | *where* in the tonal range the colour goes wrong |
| `hue` | mean OKLab hue angle | wrong wood species, brass gone pink |
| `skew` | skew of the lightness histogram | *mostly light with narrow dark notches* (grain cracks) vs *mostly dark with bright specks* (brass, stars). Negative and positive are different materials. |
| `localContrast` | mean per-pixel gradient | whether edges fall clean or fray into noise |
| `directionality` | energy in the strongest orientation wedge | grain and brushed metal are directional; paper and plaster are not |
| `runLength` | mean horizontal run of below-p30 pixels, as a fraction of width | whether dark features *run* or close into blobs |
| `aspect` | autocorrelation length along x ÷ along y | how many times longer a feature is than it is tall — the "too stretched" number |
| `scale` bands | energy per octave, coarse → fine | how many distinct depths of structure exist, and at what sizes |

Two are worth dwelling on.

**Orientation** is what separates wood from stone at a glance, and it is a single
number. Clean bench wood measured ~0.51; a candidate at 0.66 read as
over-stretched to a human before there was a number for it.

**Scale bands** are where "there are three depths of grain" becomes checkable —
big veins, the grain proper, and the fine flow that means no part of the surface
is ever flat. If one band is empty, the surface has a scale missing and looks it.

### Rough expectations per material

Sketches to start from, not thresholds to hit. Measure the reference and let it
tell you.

| Material | directionality | scale | skew | chroma |
| --- | --- | --- | --- | --- |
| Wood | high | three populated bands | negative — dark cracks in light wood | low to mid |
| Marble | mid — veins have direction but wander | coarse veins + fine crystal | mild | low |
| Brass | high, but from the *highlight*, not the body | mostly fine | positive — bright specular on a dark body | mid, narrow hue |
| Paper / plaster | low, near isotropic | fine only | near zero | very low |

### The noise floor, and why you need one

Measure two clean patches of the *same* material before comparing anything to
it — and make sure they really are the same. Columns 1 to 3 of the reference
board are three *different* wood stages by design, so using them as a floor
overstates it. Two patches from the same column give:

| | aspect | scale-d | runLength |
| --- | --- | --- | --- |
| patch A (above the card) | 7.3:1 | — | 0.031 |
| patch B (below the button) | 7.5:1 | 0.87 | 0.054 |

So on this material: **aspect is stable to ×1.03** and is the sharpest
discriminator in the suite; a scale distance under ~0.9 is indistinguishable
from the real thing. Orientation distance between clean patches of the same
material runs ~1.4, which makes that term useless for ranking and voids the
orientation comparisons made before this was measured — `aspect` replaces it
for anything to do with stretch.

Without a floor there is no way to know when to stop, and it is easy to keep
"improving" a number that stopped meaning anything.

### How they mislead

Four real failures, in the order they happened:

1. **Matching 1-D marginals is not matching the texture.** Matching the spectrum
   along x and along y independently, then optimising, produced a texture with
   the right energy at every scale arranged as isotropic blobs — cracked
   leather, scoring *better* than the wood it replaced. Orientation has to be
   measured in 2-D, jointly. This is why `directionality` exists and is weighted.
2. **Matching mean colour is not matching the colour distribution.** A candidate
   hit mean hue and mean chroma almost exactly and looked like varnished pine,
   because the reference is many dark low-chroma pixels plus a few warm bright
   ones while the candidate was uniformly golden. `chromaByL` and `lightRange`
   were added for this and do catch it — a texture reading "chroma ok" turned
   out to span lightness 0.33–0.38 where the reference spans 0.34–0.46, i.e. no
   light grain at all. Two lessons came with them:

   - **A stack of `multiply` layers cannot produce light grain.** Multiply only
     darkens, so no ramp adjustment will lift the top end; widening the ramp's
     light endpoint moved rendered lightness range from 0.023 to 0.049 and just
     darkened everything. A `screen` layer took it to 0.108 against the
     reference's 0.115.
   - **Do not assume which way chroma moves with lightness.** The intuition that
     light grain is pale and desaturated is wrong for this reference, whose
     chroma *rises* with lightness. Building to the assumption gave grey
     scratches; building to the measurement gave warm fibre.
3. **The reference crop dominates the result.** An early crop included a card
   edge and a blown highlight. It reported contrast 0.227 and directionality
   0.70; a clean crop of the same plank reported 0.135 and 0.51. Conclusions
   drawn from the first crop — including "the scale gap is the big unfixable
   problem" — were largely an artefact. Crop pure material, no edges, no
   specular blowouts, and look at two crops before believing anything.
4. **`directionality` can be lowered two ways and only one is right.** A
   candidate measured 0.66 against the reference's 0.51, so the anisotropy was
   reduced to close the gap. That produced closed lens shapes — "stretched
   circles" — because as elongation drops, contours stop running off the edge
   and close into loops. The reference is *less* directional because it carries
   more fine detail, not because its lines are shorter. Neither the orientation
   histogram nor structure-tensor coherence separates those two cases; both
   score a loop and a line the same. `runLength` was added because of this, and
   does separate them: the loopy version reads -0.023 against the reference
   where the correct one reads -0.009.
5. **Measure at the size the surface is actually displayed.** Every band in
   this suite is in cycles per *pixel*, so the same texture measured on a 680px
   swatch and a 200px one gives different answers — and the 680px one is not the
   one that ships. A Workshop column on the reference board is ~210px wide.
   A recipe tuned on wide swatches measured 11/29/30/21/6/4 there against the
   board's 3/6/7/25/40/18: far too coarse, reading as soft mush at the size it
   will be seen. Crop the reference at display scale and render the candidate at
   display scale, or the numbers describe a zoom nobody will look at.
6. **A crop can contain the design, not just the material.** Coarse-band energy
   in a bench strip was read as a plank seam and nearly became a feature. It was
   the accent rule under the chapter numeral in one crop and the shadowed edge
   of a button in another. The reference bench has **no seams at all** — it is
   one continuous surface, and so are the cards. This is failure 3 again in a
   new costume: check what is physically in the crop at 4x zoom before drawing
   any conclusion from its numbers.
7. **`directionality` cannot rank stretch; `aspect` can.** Two textures that both
   run horizontally get near-identical orientation histograms however different
   their elongation, and the term's own noise floor (~1.4) swamps the signal.
   The autocorrelation aspect ratio is direct and stable to ×1.03: a candidate
   that read "ok" on directionality measured 14.5:1 against the reference's
   7.3:1, exactly the 2x over-stretch the owner had already called by eye.
8. **Legitimate lighting scores badly.** Adding the warm top-and-bottom wash the
   reference clearly has made the distance worse, because it is low-frequency
   energy the spectrum penalises. The metric is blind to whether a difference is
   the material or the light on it.

### A limit that turned out not to be one

An earlier version of this doc claimed `feTurbulence` cannot be made to peak in
one octave, and that matching a reference which does would need baked tiles.
That was wrong, and the error was `numOctaves`. Fractal noise at 2+ octaves
*does* spread a power-law tail downward and no amount of parameter search fixes
it. At **`numOctaves="1"` each layer is narrow-band**, and a stack of
single-octave layers at staggered frequencies is band-limited noise — which is
the thing that was supposed to be impossible.

The reference bench peaks at 43% in one band. Multi-octave layers plateaued at
scale-d 1.90 with a monotonically falling profile. Single-octave layers at the
same frequencies scaled 5x finer reach 6/9/24/33/20/8 against 5/10/21/43/13/9,
scale-d **0.60** — below the noise floor above.

## Product consequences

- Materials get measured against a reference crop before they are called done,
  and the numbers go in the PR description so a reviewer can see which axis was
  off and by how much.
- New materials — the other wood species, marble, brass, paper — start by
  measuring their reference and reading which axes differ, rather than by
  guessing parameters. The suite is material-agnostic; only the target changes.
- When the numbers and the eye disagree, **the eye wins and the metric gets a
  new term**, as happened with orientation. A metric that has been overfitted to
  is worse than no metric.
- Contrast-bearing checks stay separate. `check:contrast` and the per-chapter
  assertions in `lib/progression-stage.test.ts` govern legibility; these metrics
  govern resemblance and have nothing to say about whether text is readable.

## What we reject

- **Metrics as an acceptance gate.** None of this runs in `verify`. It is a tool
  for the person or agent doing the work, not a threshold anything must pass —
  precisely because it can be satisfied by worse-looking output.
- **A single scalar "similarity score".** The per-axis breakdown is the useful
  part; collapsing it hides which knob to turn and invites optimising the
  aggregate.
- **Chasing every axis to zero.** Differences that are lighting, framing, or
  photographic rather than material are not defects.
- **A pixel-diff or SSIM against the reference.** Procedural material should
  match a reference *statistically*, never pixel-for-pixel; it would fail
  immediately on a different noise seed while looking identical.

## Open questions

- Percentile-based colour comparison instead of means, to close failure mode 2.
- Whether the suite should take an explicit display width and resample both
  inputs to it, so failure mode 5 cannot happen by accident.
- Whether `runLength` needs a vertical counterpart for materials whose features
  run the other way, or a rotation-aware version for marble veins.
- Whether a lighting-invariant variant is worth it — high-pass the image before
  the spectrum so the warm wash stops being penalised.
- Whether the per-material expectation table above survives contact with marble
  and brass, or turns out to need per-material terms.
- Whether baked tiles change the picture enough that the band-limiting limit
  stops mattering.

## Related

- [STUDY-028](STUDY-028-irregular-borders.md) — irregular edges
- [STUDY-029](STUDY-029-progressive-textures.md) — progressive textures
- [STUDY-030](STUDY-030-procedural-wood-grain.md) — what wood grain should be;
  this doc measures against it, it does not redefine it
- [`docs/plans/progression-theme-system.md`](../plans/progression-theme-system.md)
- `scripts/texture-metrics.mjs`, `scripts/lib/png.mjs`
