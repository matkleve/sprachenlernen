#!/usr/bin/env python3
"""Export method section WebP banners from an exploration grid.

Source: design/method-sections/sources/method-sections-grid-v1.png
Output: public/assets/method-sections/method-section-{section}.webp

Grid layout: 4 columns × 2 rows (study/39). Crops omit baked-in cell labels.
Pads to banner aspect before resize — never stretch square cells to 3.2∶1.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "design/method-sections/sources/method-sections-grid-v1.png"
OUT_DIR = ROOT / "public/assets/method-sections"

# Row-major grid positions (col, row)
SECTION_GRID: list[tuple[str, int, int]] = [
    ("reading", 0, 0),
    ("listening", 1, 0),
    ("speaking", 2, 0),
    ("writing", 3, 0),
    ("form", 0, 1),
    ("vocabulary", 1, 1),
    ("world", 2, 1),
    ("commitments", 3, 1),
]

OUTPUT_SIZE = (1600, 500)
TARGET_ASPECT = OUTPUT_SIZE[0] / OUTPUT_SIZE[1]
COLS, ROWS = 4, 2
# Trim grid gutters and baked-in caption strip at cell bottom.
MARGIN_X_FRAC = 0.045
MARGIN_TOP_FRAC = 0.06
MARGIN_BOTTOM_FRAC = 0.16
# Warm Scholar canvas — matches app/globals.css --color-canvas
PAD_RGB = (247, 244, 239)


def crop_cell(img: Image.Image, col: int, row: int) -> Image.Image:
    width, height = img.size
    cell_w = width / COLS
    cell_h = height / ROWS
    x0 = int(col * cell_w + cell_w * MARGIN_X_FRAC)
    y0 = int(row * cell_h + cell_h * MARGIN_TOP_FRAC)
    x1 = int((col + 1) * cell_w - cell_w * MARGIN_X_FRAC)
    y1 = int((row + 1) * cell_h - cell_h * MARGIN_BOTTOM_FRAC)
    return img.crop((x0, y0, x1, y1))


def pad_to_aspect(cell: Image.Image) -> Image.Image:
    """Letterbox to banner aspect — preserves motif proportions (no stretch)."""
    w, h = cell.size
    current = w / h
    if current < TARGET_ASPECT:
        new_w = int(round(h * TARGET_ASPECT))
        canvas = Image.new("RGB", (new_w, h), PAD_RGB)
        canvas.paste(cell, ((new_w - w) // 2, 0))
        return canvas
    new_h = int(round(w / TARGET_ASPECT))
    canvas = Image.new("RGB", (w, new_h), PAD_RGB)
    canvas.paste(cell, (0, (new_h - h) // 2))
    return canvas


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"Missing grid source: {SOURCE}")

    grid = Image.open(SOURCE).convert("RGB")
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for section, col, row in SECTION_GRID:
        cell = crop_cell(grid, col, row)
        banner = pad_to_aspect(cell)
        banner = banner.resize(OUTPUT_SIZE, Image.Resampling.LANCZOS)
        target = OUT_DIR / f"method-section-{section}.webp"
        banner.save(target, "WEBP", quality=86, method=6)
        print(f"wrote {target}")


if __name__ == "__main__":
    main()
