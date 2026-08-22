# 33 · Wood cracks: morphology, measurement, and what the tree actually does

<!-- id: STUDY-033 -->
<!-- type: reasoning -->
<!-- status: active -->
<!-- related: STUDY-031, STUDY-032, wood-texture-lab, progression-reference-board -->

## Thesis

Wood **cracks** in a photo are not the same object as wood **grain**. Grain is
the repeating fibre texture; cracks are rare, deep, directional failures in that
field. A pipeline that synthesises grain well can still fail on cracks — and a
stripe generator that draws four horizontal dashes fails on both biology and
math. This chapter records two independent readings of the same pipeline:
a **mathematician's** account of the operators and metrics, and a **naturalist's**
account of what oak is doing in the image. Together they define what
`scripts/wood-grain-fourier-synthesis.py` must approximate and what
`scripts/wood-crack-metrics.py` and `scripts/texture-metrics.mjs` must catch
when it does not.

## Evidence

### Mathematician's account

Treat the luminance image \(I(x,y)\) as a height field: bright ridges, dark
valleys. Structure separates into a **base grain field** \(G\) (narrow-band,
directional, nearly everywhere) and a **crack residual** \(C\) (sparse,
heavy-tailed, mostly zero).

**Photo extraction** (best quality, not generated):

\[
C_{\text{photo}} = \max\bigl(0,\; (G_\sigma * I) - I\bigr)
\]

Wide \(\sigma\) suppresses fine grain and keeps only defects wider than the blur
support. Percentile sparsification zeros the weakest positive residuals so HB
noise does not flood the layer.

**Heeger–Bergen** resynthesis matches the **spectrum** and **histogram** of
\(C_{\text{photo}}\) but produces blobby fields — pairwise correlation without
sparse marginals yields Gaussian haze. Not used when sharp cracks matter.

**Morphological synthesis** (generated, no photo measurement) builds a synthetic
topography \(H\) from anisotropic smooth noise (wider correlation along \(x\)
than \(y\)) plus a coarse bump from the synthesised grain. Fine grain is
deliberately excluded from \(H\); otherwise every ridge becomes a micro-valley
and the mask turns to salt-and-pepper.

Valley extraction on \(H\):

1. Coarse surface \(H_c = G_{(\sigma_y,\sigma_x)} * H\) with \(\sigma_x > \sigma_y\).
2. Multi-scale blur-difference valleys:
   \(V_s = \max(0,\; G_s * H_c - H_c)\) at large horizontal-biased scales \(s\).
3. Morphological grooves: black top-hat
   \(T = H_c - \mathrm{dilate}_{(k_y,k_x)}(H_c)\) with a wide horizontal
   structuring element \((k_y \ll k_x)\).
4. Fuse \(\max(V, T)\); **grey-closing** along \(x\) connects broken segments;
   **grey-opening** along \(x\) and a thin vertical opening drop pepper and
   circular pits; white-tophat subtraction thins wide grooves to centerlines.
5. Percentile keep + optional floor → normalised crack field \(C_{\text{morph}}\).

**Rim** is not isotropic: vertical gradient of the crack field biases highlight
to one side of the split (simulated frayed fibre lip). Low-frequency noise masks
rim length — only the larger defects carry a lit edge.

**Metrics — two layers:**

| Tool | Domain | What it proves |
| --- | --- | --- |
| `texture-metrics.mjs` | Final RGB tile vs reference photo | Tone, OKLab curves, **aspect** (autocorrelation length \(x/y\)), **runLength** (horizontal dark runs vs closed blobs), directionality, scale bands |
| `wood-crack-metrics.py` | Crack mask (and final MSE/corr) | **Component count**, **mean blob area**, **median crack width**, aspect of components, FFT horizontal/vertical energy ratio, mask correlation to reference, tail mass in top 5% of crack pixels |

Real crack masks measured on `wood-01` show ~1500 connected components, median
width ~2 px, aspect ~6, heavy tail (~7.5% of crack energy in the brightest 5%
of crack pixels). Morphological v4 at the same coverage lands in ~8 components
averaging ~2200 px each — same ink budget, wrong geometry. `texture-metrics`
flags the final as aspect 0.5:1 vs photo 9.7:1; `wood-crack-metrics` flags blob
ratio ~200×. The tools agree: blobs are not cracks.

### Naturalist's account

**Grain** is the visible path of **fibres** in the wood — in flat-sawn oak on a
bench, they run roughly horizontal in the photo because the board was sawn
parallel to the face. The camera sees alternating dense and open zones: rays,
growth-period density, and cut fibre ends. That texture is continuous, shallow,
and everywhere.

**Cracks** are different failures:

- **Checking** — tensile stress across the grain opens a **fissure**: a narrow
  slot where fibres have pulled apart. In the image it is a dark line **along**
  the grain, often tapered at the ends, sometimes branching slightly. Width is
  hairline to a few fibres; length can span much of the board.
- **Compression bruising** and **raised lips** — beside a real split, one side
  often shows a **frayed, slightly lighter ridge** where fibres were torn and
  lifted. The dark is on one side of the lip, not symmetrically around a blob.
- **Pits and stains** — circular or irregular dark marks from knots, insect
  galleries, or finish penetration. These read as **islands**, not runs. They
  are not checking.

The rejected **four-stripe procedural** pattern mimics checking's direction but
not its statistics: equal spacing, equal length, zigzag edges — a human sees
machined scoring, not drying stress.

**Morphological valleys** on a smooth synthetic hill map produce **basins**:
regions that are locally lower than their neighbourhood. Without aggressive
thinning, basins merge into **ponds** — biologically closer to a knot stain or
a sanded depression than to a fissure. The naturalist reads morph v3/v4 blobs
as "water damage" or "router slip", not "the board checked."

**Photo extraction** wins because it measures actual fissures: thousands of
short fragments and a few long ones, 1–2 px wide, placed where the tree already
failed. That is the target distribution for any generator that claims to be wood.

**Rim-on** synthesis is visually right when cracks are right: the lip highlight
only belongs beside a real groove. On blob masks, rim turns ponds into raised
craters — the halo problem from STUDY-032.

## Product consequences

- `--crack-source extracted` for hero tiles where crack fidelity matters; layer
  the measured mask, do not resynthesise it.
- `--crack-source morphological` for tiles that need **generated** placement
  without a photo — unpredictable, but not yet metric-valid against extracted.
- Always verify with **both** metric scripts before shipping a tile into
  `design/progression/`:

```bash
node scripts/texture-metrics.mjs patches/wood-01.png synthesized/wood-01_final.png
python3 scripts/wood-crack-metrics.py reference_crack_sparse.png candidate_crack.png
python3 scripts/wood-crack-metrics.py --source patches/wood-01.png synthesized/wood-01_final.png
```

- `scripts/build-morph-comparison.py` — visual montage for human review alongside numbers.

## What we reject

| Alternative | Why |
| --- | --- |
| Four horizontal procedural stripes | Regular spacing; not checking statistics |
| HB-only crack synthesis | Blobby marginals; rim halos on wrong geometry |
| Morphological valleys without thinning | Basins and ponds, not fissures |
| Metrics on finals only | Misses crack-mask structure (`wood-crack-metrics` required) |
| Claiming morph v4 "matches" photo on coverage alone | Same mean intensity, 200× blob size |

## Open questions

- Watershed ridge lines or skeleton on inverted topography as morph v5 — target
  the extracted component statistics, not just coverage.
- Run both metric suites against `design/progression/reference-board.png` once
  the owner's grid photo is committed (STUDY-032 gate).
- Per-tile `--seed` for morphological placement — does not fix width/blob metrics yet.

## Related

| Doc | Role |
| --- | --- |
| [STUDY-032](STUDY-032-photographic-wood-grain-synthesis.md) | Full FFT grain + rim pipeline |
| [STUDY-031](STUDY-031-texture-metrics.md) | General texture measuring tape |
| `scripts/wood-grain-fourier-synthesis.py` | Synthesis implementation |
| `scripts/wood-crack-metrics.py` | Crack-mask structure metrics |
| `scripts/texture-metrics.mjs` | Final-tile texture metrics |
| `scripts/build-morph-comparison.py` | Visual comparison montage |
