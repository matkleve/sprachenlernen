# Method section graphics

Editorial banner assets for the methods catalogue — one abstract image per
section. Contract: [`docs/explorations/../../explorations/EXP-039-method-section-graphics-brief.md`](../docs/explorations/../../explorations/EXP-039-method-section-graphics-brief.md).

## Structure

```
design/method-sections/
  sources/     Exploration grids (PNG)
  README.md    This file

public/assets/method-sections/
  method-section-{section}.webp   Shipped banners (8 files)
```

## Workflow

1. **Explore** — generate or receive a 4×2 grid; save to `sources/`.
2. **Export** — `python3 scripts/build-method-section-graphics.py`
3. **Verify** — `npm test -- method-card-header` and visual check on `/methods`.

Current grid: `sources/method-sections-grid-v1.png` (ChatGPT / image gen, 2026-08-18).

## Sections

| Section | File |
| --- | --- |
| reading | `method-section-reading.webp` |
| listening | `method-section-listening.webp` |
| speaking | `method-section-speaking.webp` |
| writing | `method-section-writing.webp` |
| form | `method-section-form.webp` |
| vocabulary | `method-section-vocabulary.webp` |
| world | `method-section-world.webp` |
| commitments | `method-section-commitments.webp` |
