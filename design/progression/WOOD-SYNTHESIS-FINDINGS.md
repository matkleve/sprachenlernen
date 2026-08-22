# Wood synthesis — session findings (2026-08-22)

**Purpose:** Record what worked, what failed, and where each technique belongs.
This is the wrap-up for the full wood-grain exploration session (FFT, threshold
valleys, neural Gatys/VAE, procedural runtime calibration).

**Invariant (unchanged):** Dark = valley, light = ridge. App runtime = procedural
canvas (`lib/wood-grain-ridges.ts`) — no PNG tile pop-in. Offline synthesis is
**lab/calibration only** unless the owner explicitly overrides that constraint.

---

## Executive summary

| Approach | Verdict | Use for |
| --- | --- | --- |
| **Threshold luminance valleys (q=0.12)** | ✅ Best crack **width** extraction | FFT hybrid pipeline; measuring real fissures |
| **Gatys grayscale + albedo colorize** | ✅ Best **generative look** (owner: *"looks amazing"*) | Visual target / mood board; not runtime |
| **FFT breakthrough (FEATURE_SCALE=1)** | ✅ Close on wood-01 structure (owner: *"so close"*) | Lab tile; hybrid (photo cracks + synth grain) |
| **Procedural canvas + calibration** | ❌ Owner: *"really bad"* | Architecture correct; tuning not done |
| Ridge-envelope + HB cracks | ❌ Narrows wide cracks | Diagnostic only |
| Poisson scatter / boolean canalize | ❌ Black rectangles | Rejected |
| Full RGB Gatys | ❌ Hue/chroma drift | Rejected |
| VAE neural | ❌ Poor metrics | Rejected |

**App decision:** Ship procedural runtime only. Use offline best results to inform
preset tuning — do not promote synthesized PNGs to `public/` without owner sign-off.

---

## Best results

### 1. Threshold luminance valleys — best crack extraction

**Winner for crack width.** Owner selected bottom-left overlay in valley comparison:
`threshold luminance q=0.12`.

| | |
| --- | --- |
| **Code** | `lib/wood_valley_threshold.py` → `luminance_valley_depth(height, dark_quantile=0.12)` |
| **Formula** | `depth = clip(thr − L, 0) / thr` (no blur) |
| **Why it won** | Preserves true crack width. Row 242 on wood-01: threshold ~168 px vs envelope ~102 px |
| **Wired in** | `scripts/wood-grain-fourier-synthesis.py` as primary valley layer |
| **Limitation** | **Hybrid** — crack positions measured from source photo; not infinite tiling |

```bash
python3 scripts/wood-grain-fourier-synthesis.py design/progression/patches/wood-01.png wood-01
```

**Artifacts:** `design/progression/layer-explorer/wood-01/` (pipeline layers),
`design/progression/synthesized/wood-01_final.png`

---

### 2. Gatys grayscale relief + albedo colorize — best generative visual

Owner reaction at 507×507: **"looks amazing"**.

| | |
| --- | --- |
| **Code** | `lib/wood_neural_synthesis.py`, `scripts/wood-grain-neural-synthesis.py` |
| **Pipeline** | Gatys on luminance only → shading map → `albedo × shading / 128` |
| **Cloud fix** | Downweight VGG relu4/5, `suppress_lowfreq_blobs()`, `boost_weak_detail()` |
| **Limitation** | PyTorch ~4 min CPU, no seamless tile, not for app runtime |

```bash
python3 scripts/wood-grain-neural-synthesis.py design/progression/patches/wood-01.png wood-01 gatys --steps 400
```

**Artifacts:**
- `design/progression/synthesized/wood-01_neural_gatys_final.png` ← best neural output
- `design/progression/synthesized/wood-01_neural_gatys_shading.png`

**Metrics vs board bench crop** (`board-workshop-1-bench.png`):

| Metric | delta | Notes |
| --- | --- | --- |
| tone | −0.064 | slightly dark |
| contrast | −0.215 | narrow range |
| lightRange | −0.192 | missing highlights |
| sortedL dist | 0.159 | best among generative candidates |
| chroma | ok | grey+albedo avoids pink drift |

---

### 3. FFT breakthrough — native crack scale

Owner reaction: **"Omg this is so close"**.

| | |
| --- | --- |
| **Root cause fixed** | `FEATURE_SCALE=9.0` blew crack spectrum ~9× → bubbly blobs |
| **Fix** | `FEATURE_SCALE` default **9.0 → 1.0** |
| **Reference tile** | `design/progression/breakthrough-wood-01-final.png` |

**Metrics vs board bench crop:**

| Metric | delta | Notes |
| --- | --- | --- |
| tone | −0.067 | dark |
| contrast | −0.412 | narrow |
| lightRange | −0.359 | no light grain |
| sortedL dist | 0.185 | structure improved; tone still off |

Still a **hybrid** (threshold valleys from photo + synthesized grain). Good for
same-photo remake, not fully generative infinite tiling.

---

## Bad results (rejected or failed)

| Approach | Problem | Evidence |
| --- | --- | --- |
| **Ridge-envelope + HB cracks** | Narrows wide cracks (~102 px vs ~168 px threshold) | `layer-explorer/wood-01/measured_*_valley.png` |
| **Poisson scatter / boolean canalize** | Black rectangles; ~7% ink vs ~0.8% real | `poisson_*_final.png` in layer-explorer |
| **Gaussian blur-difference** | Soft symmetric blobs, wrong physics | Rejected in STUDY-032 |
| **Full RGB Gatys** | Hue/chroma drift | Switched to grey+albedo |
| **VAE neural** | Poor metrics (sortedL dist ~0.21 at 256px) | `wood-01_neural_vae.png` |
| **Hybrid FFT final composite** | Cracks stamped from photo | Not fully generative |
| **Procedural calibration (latest)** | Owner: **"really bad"** | See below |

### Procedural runtime — attempted, visually rejected

Built: `lib/wood-valleys.ts`, `lib/wood-grain-presets.ts`, `scripts/wood-calibration.mjs`.

**Metrics vs board bench crop** (`calibration/procedural-raw-planks-507.png`):

| Metric | delta | Notes |
| --- | --- | --- |
| tone | +0.040 | ok |
| contrast | −0.257 | too narrow |
| lightRange | −0.196 | highlights clipped |
| chroma | +0.017 | too saturated |
| aspect | 2.1:1 vs 0.6:1 | wrong stretch |
| sortedL dist | 0.150 | numbers improving; eye still fails |

**Owner verdict:** really bad. Architecture (no pop-in) is correct; visual tuning
is not. See [`CALIBRATION.md`](CALIBRATION.md) for the knob table if resuming.

---

## Where things live

### Runtime (app)

| Path | Role |
| --- | --- |
| `lib/wood-grain-ridges.ts` | Canvas renderer — `/dev/wood-textures` |
| `lib/wood-valleys.ts` | Sparse procedural fissures |
| `lib/wood-grain-presets.ts` | Shared tuning (lab + progression CSS freq) |
| `app/progression-skins.css` | `/dev/progression` — CSS `feTurbulence` (not canvas yet) |

### Offline / lab (Python)

| Path | Role |
| --- | --- |
| `lib/wood_valley_threshold.py` | Threshold luminance valleys (winner) |
| `scripts/wood-grain-fourier-synthesis.py` | FFT + threshold valleys (hybrid) |
| `lib/wood_neural_synthesis.py` | Gatys + VAE |
| `scripts/wood-grain-neural-synthesis.py` | Neural CLI |
| `scripts/wood-valley-overlay-compare.py` | Valley method comparison |
| `scripts/wood-layer-explorer.py` | Pipeline layer dumps |
| `scripts/requirements-neural-wood.txt` | Optional PyTorch deps |

### Calibration (Node)

| Path | Role |
| --- | --- |
| `scripts/wood-calibration.mjs` | Board crop vs procedural + texture-metrics |
| `scripts/texture-metrics.mjs` | Automated diff (diagnostic only) |

### Assets

| Path | Role |
| --- | --- |
| `design/progression/reference-board.png` | Owner nine-column board (normative) |
| `design/progression/patches/wood-01.png` … `wood-06.png` | Source patches |
| `design/progression/breakthrough-wood-01-final.png` | FFT breakthrough reference |
| `design/progression/synthesized/` | FFT + neural outputs (lab only) |
| `design/progression/layer-explorer/wood-01/` | Full pipeline layer trail |
| `design/progression/metrics-crops/` | Crops for texture-metrics |
| `design/progression/calibration/` | Procedural calibration renders |

---

## Commands reference

```bash
# FFT hybrid (threshold valleys) — best crack measurement
python3 scripts/wood-grain-fourier-synthesis.py design/progression/patches/wood-01.png wood-01

# Neural Gatys — best generative visual
python3 scripts/wood-grain-neural-synthesis.py design/progression/patches/wood-01.png wood-01 gatys --steps 400

# Procedural calibration loop
node scripts/wood-calibration.mjs

# Metrics (reference vs candidate)
node scripts/texture-metrics.mjs <reference> <candidate>
```

---

## PRs from this session

| PR | Branch | Focus |
| --- | --- | --- |
| #196 | `cursor/coarse-crack-layer-f642` | Threshold luminance valleys in FFT synthesis |
| #199 | `cursor/neural-wood-synthesis-f642` | Gatys (grey+albedo) + VAE neural synthesis |
| #202 | `cursor/procedural-wood-calibration-f642` | Procedural sparse valleys + calibration loop |

---

## Open problems (not solved)

1. **Procedural visual quality** — owner rejected latest; Gatys shading is the best
   visual target for preset tuning.
2. **Seamless tiling** — none of the offline pipelines produce infinite tiles yet.
3. **Progression CSS vs canvas** — `/dev/progression` uses CSS turbulence;
   `/dev/wood-textures` uses canvas; not unified.
4. **Owner board sign-off** — column 1 bench vs any candidate still pending.
5. **Knots** (wood-05/06) — no mechanism built.
6. **OKLCH colour ramp** — albedo×shading approximates; STUDY-031 quantile ramp untried.

---

## What we do not ship

- `design/progression/synthesized/*` in `public/`
- PyTorch at runtime
- Photo-stamped crack positions in the live app
- Any PNG tile that causes pop-in on resize

---

## Related docs

| Doc | Role |
| --- | --- |
| [`CALIBRATION.md`](CALIBRATION.md) | Procedural pass/fail checklist + knobs |
| [`docs/study/STUDY-032-photographic-wood-grain-synthesis.md`](../docs/study/STUDY-032-photographic-wood-grain-synthesis.md) | FFT pipeline reasoning |
| [`docs/study/STUDY-030-procedural-wood-grain.md`](../docs/study/STUDY-030-procedural-wood-grain.md) | Live canvas renderer |
| [`docs/study/STUDY-031-texture-metrics.md`](../docs/study/STUDY-031-texture-metrics.md) | Measuring apparatus |
| [`docs/diary/2026-08-22.md`](../docs/diary/2026-08-22.md) | FFT breakthrough diary |
| [`docs/diary/2026-08-22-procedural-calibration.md`](../docs/diary/2026-08-22-procedural-calibration.md) | Procedural pipeline diary |
| [`design/wood-grain-fourier/README.md`](../wood-grain-fourier/README.md) | Earlier FFT iteration trail |
