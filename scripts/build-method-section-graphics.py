#!/usr/bin/env python3
"""Export method section WebP banners from an exploration grid.

Source: design/method-sections/sources/method-sections-grid-v1.png
Output: public/assets/method-sections/method-section-{section}.webp

Grid layout: 4 columns × 2 rows (study/39). Crops omit baked-in cell labels.
Center-crops to banner aspect (top-weighted) — never stretch or letterbox-pad.
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
# Motif sits in the upper band; lower ~40% stays soft for CSS fade (DR-040 H5).
MOTIF_BAND_FRAC = 0.58
CANVAS_FILL = (247, 244, 239)  # Warm Scholar canvas — matches @theme canvas
COLS, ROWS = 4, 2
# Trim grid gutters and baked-in caption strip at cell bottom.
MARGIN_X_FRAC = 0.045
MARGIN_TOP_FRAC = 0.06
MARGIN_BOTTOM_FRAC = 0.16


def crop_cell(img: Image.Image, col: int, row: int) -> Image.Image:
    width, height = img.size
    cell_w = width / COLS
    cell_h = height / ROWS
    x0 = int(col * cell_w + cell_w * MARGIN_X_FRAC)
    y0 = int(row * cell_h + cell_h * MARGIN_TOP_FRAC)
    x1 = int((col + 1) * cell_w - cell_w * MARGIN_X_FRAC)
    y1 = int((row + 1) * cell_h - cell_h * MARGIN_BOTTOM_FRAC)
    return img.crop((x0, y0, x1, y1))


def compose_banner(cell: Image.Image) -> Image.Image:
    """Place motif in upper band — never stretch; bottom stays empty for fade."""
    w, h = cell.size
    motif_src = cell.crop((0, 0, w, int(h * 0.72)))
    out_w, out_h = OUTPUT_SIZE
    max_motif_h = int(out_h * MOTIF_BAND_FRAC)
    scale = min(out_w / motif_src.width, max_motif_h / motif_src.height)
    nw = max(1, int(motif_src.width * scale))
    nh = max(1, int(motif_src.height * scale))
    motif = motif_src.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", OUTPUT_SIZE, CANVAS_FILL)
    x = (out_w - nw) // 2
    y = max(0, int(out_h * 0.04))
    canvas.paste(motif, (x, y))
    return canvas


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"Missing grid source: {SOURCE}")

    grid = Image.open(SOURCE).convert("RGB")
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for section, col, row in SECTION_GRID:
        cell = crop_cell(grid, col, row)
        banner = compose_banner(cell)
        target = OUT_DIR / f"method-section-{section}.webp"
        banner.save(target, "WEBP", quality=86, method=6)
        print(f"wrote {target}")


if __name__ == "__main__":
    main()
