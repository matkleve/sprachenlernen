# 2026-08-22 — Procedural wood calibration pipeline

**Change class: Standard** — sparse valley layer, shared presets, calibration loop.

## Invariant

Runtime wood = canvas math only (`lib/wood-grain-ridges.ts`). Offline FFT/Gatys/neural
outputs are **lab targets**, never shipped as `public/` tiles.

## Shipped

- `lib/wood-valleys.ts` — sparse procedural fissures (threshold noise + horizontal pool)
- `lib/wood-grain-presets.ts` — single tuning source for wood-texture-lab + progression CSS freq
- `scripts/wood-calibration.mjs` — board bench crop vs procedural render + texture-metrics
- `design/progression/CALIBRATION.md` — pass/fail checklist + knob table
- `buildValleyMap()` precompute — 507×507 render in ~600ms

## Metrics (board-workshop-1-bench vs procedural raw-planks, first tuned pass)

| Metric | delta | Notes |
| --- | --- | --- |
| tone | +0.04 | ok |
| contrast | −0.26 | improving; still narrow |
| lightRange | −0.20 | improving |
| sortedL dist | 0.15 | was 0.26 pre-tune |

Owner eye on `/dev/wood-textures` #1 remains the gate — numbers are diagnostic only.

## Next

- Compare `/dev/progression` stage 1 bench (CSS stack) vs canvas swatch — unify if drift
- Owner sign-off column 1 on reference board
