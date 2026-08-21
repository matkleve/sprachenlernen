# Design workspace

Source files for brand and visual exploration. **Shipped assets live in
`public/`** — this folder is where designers iterate before a direction is
promoted.

## Structure

```
  design/
  logo/              App mark + wordmark explorations (SVG source)
  method-sections/   Catalogue banner explorations (grid PNG → WebP)
  progression/       Optional tile PNGs for `/dev/progression` material skins
  README.md          This file
```

Tune procedural wood at `/dev/wood-grain` before exporting tiles here.

## Workflow

1. **Explore** — open `/dev/brand` to compare logo directions at favicon,
   header, and Home Screen sizes. Directions are defined in
   `data/brand/logo-directions.json`; source SVGs live in
   `design/logo/directions/`.
2. **Review** — UX notes and constraints are in
   [`docs/explorations/EXP-035-logo-and-pwa-icon-exploration.md`](../docs/explorations/EXP-035-logo-and-pwa-icon-exploration.md).
3. **Choose** — pick a direction on `/dev/brand` (persisted in `localStorage`).
4. **Ship** — run `node scripts/sync-brand-assets.mjs <direction-id>` to copy
   the chosen mark to `public/icon.svg` and `app/icon.svg`.

Visual tokens come from **Warm Scholar** (chosen 2026-08-09 via `/dev/design`).
Do not introduce raw hex in components — reference token names in docs and use
the values from `app/globals.css` in SVG source files only.

### Progression material tiles (optional)

ChatGPT or Figma exports for the nine-stage reference board can land in
`design/progression/` as seamless PNG/WebP tiles, then sync to
`public/design/progression/` (e.g. `workshop-1-canvas.webp`, `observatory-3-card.webp`).
The dev page currently uses CSS gradients as a stand-in until those files exist.

Method section graphics brief:
[`docs/explorations/../../explorations/EXP-039-method-section-graphics-brief.md`](../docs/explorations/../../explorations/EXP-039-method-section-graphics-brief.md).

Skill-tier badge grid: save the owner’s **4×5 grid as RGBA PNG** with a
**transparent sheet** between cells (preferred — slice is crop-only). White RGB
uploads still work; the script keys only border-connected white (not interior
highlights). Save as `design/skill-tier-badges/source-grid-upload.png`, then
`python3 scripts/slice-skill-tier-badges.py`. Chat image uploads are not written
to the Cloud Agent VM — the PNG must be committed in git.

## What does not live here

- **Skill-tier badges** — `public/assets/skill-tier-badges/` (see study/33).
- **Method section art** — `public/assets/method-sections/` (editorial renders).
- **Theme presets** — `data/design-themes/presets.json` (see `/dev/design`).
