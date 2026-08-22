#!/usr/bin/env python3
"""Slice a 3×2 wood-texture reference grid into single-species PNG patches.

Source: design/progression/source-grid-wood-upload.png (owner grid, 3 cols × 2 rows).
Output: design/progression/patches/wood-01.png … wood-06.png

Margins are intentionally tight — these grids are flush species swatches with no
gutter. Default 0.5% per edge (not the 8–12% used for badge shields).
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = ROOT / "design/progression/source-grid-wood-upload.png"
DEFAULT_OUT = ROOT / "design/progression/patches"

COLS = 3
ROWS = 2
# Tight crop — owner asked for minimal edge margin on flush wood swatches.
MARGIN_X_FRAC = 0.005
MARGIN_Y_FRAC = 0.005


def crop_cell(img: Image.Image, col: int, row: int) -> Image.Image:
    width, height = img.size
    cell_w = width / COLS
    cell_h = height / ROWS
    mx = cell_w * MARGIN_X_FRAC
    my = cell_h * MARGIN_Y_FRAC
    x0 = int(col * cell_w + mx)
    y0 = int(row * cell_h + my)
    x1 = int((col + 1) * cell_w - mx)
    y1 = int((row + 1) * cell_h - my)
    return img.crop((x0, y0, x1, y1))


def main() -> None:
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_SOURCE
    out_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUT

    if not source.exists():
        raise SystemExit(f"Missing grid source: {source}")

    grid = Image.open(source).convert("RGB")
    out_dir.mkdir(parents=True, exist_ok=True)

    index = 1
    for row in range(ROWS):
        for col in range(COLS):
            cell = crop_cell(grid, col, row)
            target = out_dir / f"wood-{index:02d}.png"
            cell.save(target)
            print(f"wrote {target} ({cell.size[0]}x{cell.size[1]}, margin {MARGIN_X_FRAC:.1%})")
            index += 1


if __name__ == "__main__":
    main()
