# Wood calibration — procedural runtime target

**Contract:** offline synthesis (FFT, Gatys) is a **lab only** — tune presets here,
ship **zero PNG tiles** in the app. Runtime = `lib/wood-grain-ridges.ts` canvas.

## Pass/fail checklist (Workshop stage 1 / raw planks)

Owner eye on `/dev/wood-textures` swatch #1 and `/dev/progression` stage 1 vs
`design/progression/reference-board.png` column 1:

1. Grain runs **horizontal** (left → right along the plank)
2. Warm **matte brown** — not pink, not grey soup
3. **No barcode** — no alternating light/dark plank stripes
4. Fissures are **sparse** and **elongated** along the grain (not round blobs)
5. Bench wood vs stone **card** remain two readable surfaces (ink contrast)

Automated diff is diagnostic only — see [STUDY-031](../docs/study/STUDY-031-texture-metrics.md).

## Run the loop

```bash
# Render procedural + diff against board bench crop
node scripts/wood-calibration.mjs

# Custom reference crop
node scripts/wood-calibration.mjs design/progression/patches/wood-01.png
```

**Tune knobs** (single source): `lib/wood-grain-presets.ts`

| Knob | Layer |
| --- | --- |
| `ridgeCount`, `warpAmount`, `warpFrequency` | Directional grain |
| `palette`, `lightStrength`, `speckle` | Tone and fibre read |
| `valleys.threshold`, `runWidth`, `strength` | Sparse fissures |

Progression CSS grain frequency follows presets: `PROGRESSION_WOOD_GRAIN_FREQ` in the same file.

## Files

| Path | Role |
| --- | --- |
| `metrics-crops/board-workshop-1-bench.png` | Reference crop (column 1 bench) |
| `calibration/procedural-raw-planks-507.png` | Generated candidate (gitignored optional) |
| `lib/wood-valleys.ts` | Sparse crack math |
| `lib/wood-grain-ridges.ts` | Canvas renderer |
| `lib/wood-grain-presets.ts` | Shared tuning |

## What we do not ship

- `design/progression/synthesized/*` neural/FFT tiles in `public/`
- PyTorch at runtime
- Photo-stamped crack positions
