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
| `hue` | mean OKLab hue angle | wrong wood species, brass gone pink |
| `skew` | skew of the lightness histogram | *mostly light with narrow dark notches* (grain cracks) vs *mostly dark with bright specks* (brass, stars). Negative and positive are different materials. |
| `localContrast` | mean per-pixel gradient | whether edges fall clean or fray into noise |
| `directionality` | energy in the strongest orientation wedge | grain and brushed metal are directional; paper and plaster are not |
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
   ones while the candidate was uniformly golden. Percentiles would catch this;
   means do not.
3. **The reference crop dominates the result.** An early crop included a card
   edge and a blown highlight. It reported contrast 0.227 and directionality
   0.70; a clean crop of the same plank reported 0.135 and 0.51. Conclusions
   drawn from the first crop — including "the scale gap is the big unfixable
   problem" — were largely an artefact. Crop pure material, no edges, no
   specular blowouts, and look at two crops before believing anything.
4. **Legitimate lighting scores badly.** Adding the warm top-and-bottom wash the
   reference clearly has made the distance worse, because it is low-frequency
   energy the spectrum penalises. The metric is blind to whether a difference is
   the material or the light on it.

### A limit that is not the metric's fault

`feTurbulence` produces fractal noise: a power-law falloff spreading down from
its base frequency. It cannot be made to *peak* in one octave. Where a reference
concentrates half its energy in a single band, parameter search plateaus — two
searches over ~250 candidates would not move it. Reaching that shape needs
band-limited noise, i.e. baking the tile offline rather than generating it in a
filter chain.

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
