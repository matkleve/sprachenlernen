# Design workspace

Source files for brand and visual exploration. **Shipped assets live in
`public/`** — this folder is where designers iterate before a direction is
promoted.

## Structure

```
  design/
  logo/                App mark + wordmark explorations (SVG source)
  method-sections/     Catalogue banner explorations (grid PNG → WebP)
  progression/         Optional tile PNGs for `/dev/progression` material skins
  wood-grain-fourier/  2D-FFT wood-grain synthesis: source photos, patches, outputs
  README.md            This file
```

### Progression reference board (normative)

The nine-column board is the visual contract — not optional art. See
[`docs/specs/feature/progression-reference-board.md`](../docs/specs/feature/progression-reference-board.md).
Commit `design/progression/reference-board.png` before agents wire materials.
Tune procedural wood at `/dev/wood-grain` only to converge on a board column.

## Workflow

1. **Explore** — open `/dev/brand` to compare logo directions at favicon,
   header, and Home Screen sizes. Directions are defined in
   `data/brand/logo-directions.json`; source SVGs live in
   `design/logo/directions/`.
2. **Review** — UX notes and constraints are in
   [`docs/explorations/EXP-035-logo-and-pwa-icon-exploration.md`](../docs/explorations/EXP-035-logo-and-pwa-icon-exploration.md).
3. **Choose** — pick a direction on `/dev/brand` (persisted in `localStorage`).
4. **Ship** — run `node scripts/design/sync-brand-assets.mjs <direction-id>` to copy
   the chosen mark to `public/icon.svg` and `app/icon.svg`.

Visual tokens come from **Warm Scholar** (chosen 2026-08-09 via `/dev/design`).
Do not introduce raw hex in components — reference token names in docs and use
the values from `app/globals.css` in SVG source files only.

### Progression material tiles (optional)

ChatGPT or Figma exports for the nine-stage reference board can land in
`design/progression/` as seamless PNG/WebP tiles, then sync to
`public/design/progression/` (e.g. `workshop-1-canvas.webp`, `observatory-3-card.webp`).
The dev page currently uses CSS gradients as a stand-in until those files exist.

**Wood tiles specifically:** the primary method is
`python3 scripts/design/wood-grain-fourier-synthesis.py <photo.png> <wood-name>` — 2D
FFT analysis of a single-species reference photo, synthesized back into a
seamless tile (grain direction, crack layer, and lighting all measured from
the source rather than hand-tuned). Reasoning and evidence:
[`docs/study/STUDY-032-photographic-wood-grain-synthesis.md`](../docs/study/STUDY-032-photographic-wood-grain-synthesis.md).
**Breakthrough reference (2026-08-22):** `design/progression/breakthrough-wood-01-final.png`
— native `FEATURE_SCALE=1`; do not reintroduce scale 9 without owner GO.
Source photo: one wood species per image (not a multi-species grid — that
splits resolution and creates seam artifacts), max resolution, flat lighting,
zero perspective, PNG. Multi-species exploration grids are sliced first:
save as `design/progression/source-grid-wood-upload.png`, then
`python3 scripts/slice-wood-texture-grid.py` (0.5% edge margin) and
`python3 scripts/wood-grain-fourier-synthesis.py` per patch. Chat image
uploads are not written to the Cloud Agent VM — commit the PNG in git.

Every image from building this pipeline — source photos, cropped patches,
and the full iteration trail — is archived and indexed at
[`design/wood-grain-fourier/README.md`](wood-grain-fourier/README.md).
Current best output: `design/wood-grain-fourier/outputs/final/`.

Method section graphics brief:
[`docs/explorations/EXP-039-method-section-graphics-brief.md`](../docs/explorations/EXP-039-method-section-graphics-brief.md).

Skill-tier badge grid: save the owner’s **4×5 grid as RGBA PNG** with a
**transparent sheet** between cells (preferred — slice is crop-only). White RGB
uploads still work; the script keys only border-connected white (not interior
highlights). Save as `design/skill-tier-badges/source-grid-upload.png`, then
`python3 scripts/design/slice-skill-tier-badges.py`. Chat image uploads are not written
to the Cloud Agent VM — the PNG must be committed in git.

## What does not live here

- **Skill-tier badges** — `public/assets/skill-tier-badges/` (see study/33).
- **Method section art** — `public/assets/method-sections/` (editorial renders).
- **Theme presets** — `data/design-themes/presets.json` (see `/dev/design`).
