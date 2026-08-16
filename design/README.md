# Design workspace

Source files for brand and visual exploration. **Shipped assets live in
`public/`** — this folder is where designers iterate before a direction is
promoted.

## Structure

```
design/
  logo/           App mark + wordmark explorations (SVG source)
  README.md       This file
```

## Workflow

1. **Explore** — open `/dev/brand` to compare logo directions at favicon,
   header, and Home Screen sizes. Directions are defined in
   `data/brand/logo-directions.json`; source SVGs live in
   `design/logo/directions/`.
2. **Review** — UX notes and constraints are in
   [`docs/study/35-logo-and-pwa-icon-exploration.md`](../docs/study/35-logo-and-pwa-icon-exploration.md).
3. **Choose** — pick a direction on `/dev/brand` (persisted in `localStorage`).
4. **Ship** — run `node scripts/sync-brand-assets.mjs <direction-id>` to copy
   the chosen mark to `public/icon.svg` and `app/icon.svg`.

Visual tokens come from **Warm Scholar** (chosen 2026-08-09 via `/dev/design`).
Do not introduce raw hex in components — reference token names in docs and use
the values from `app/globals.css` in SVG source files only.

## What does not live here

- **Skill-tier badges** — `public/assets/skill-tier-badges/` (see study/33).
- **Method section art** — `public/assets/method-sections/` (editorial renders).
- **Theme presets** — `data/design-themes/presets.json` (see `/dev/design`).
