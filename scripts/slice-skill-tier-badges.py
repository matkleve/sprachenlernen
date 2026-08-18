#!/usr/bin/env python3
"""Slice the 4×5 skill-tier badge grid into PNG assets with white removed."""

from __future__ import annotations

import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = (
    Path.home()
    / ".cursor/projects/home-matthias-Projects-sprachenlernen/assets"
    / "image-gen-1_1_-a3fde67c-414c-405e-84ab-bc9ecac24416.png"
)
DESIGN_SOURCE = ROOT / "design/skill-tier-badges/source-grid.png"
OUT_DIR = ROOT / "public/assets/skill-tier-badges"

SKILLS = ["reading", "listening", "speaking", "writing"]
TIERS = ["wood", "bronze", "silver", "gold", "platinum"]

# Trim gutters inside the uniform grid (tune once per source art).
MARGIN_X = 0.04
MARGIN_Y = 0.06
GUTTER_X = 0.02
GUTTER_Y = 0.03


def white_to_alpha(image: Image.Image, threshold: int = 238) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if r >= threshold and g >= threshold and b >= threshold:
                pixels[x, y] = (r, g, b, 0)
    return rgba


def crop_cell(image: Image.Image, col: int, row: int) -> Image.Image:
    width, height = image.size
    cell_w = width / len(SKILLS)
    cell_h = height / len(TIERS)

    left = col * cell_w + cell_w * MARGIN_X
    top = row * cell_h + cell_h * MARGIN_Y
    right = (col + 1) * cell_w - cell_w * MARGIN_X
    bottom = (row + 1) * cell_h - cell_h * GUTTER_Y

    if col > 0:
        left += cell_w * GUTTER_X / 2
    if col < len(SKILLS) - 1:
        right -= cell_w * GUTTER_X / 2
    if row > 0:
        top += cell_h * GUTTER_Y / 2
    if row < len(TIERS) - 1:
        bottom -= cell_h * GUTTER_Y / 2

    return image.crop((int(left), int(top), int(right), int(bottom)))


def main() -> None:
    source = DESIGN_SOURCE if DESIGN_SOURCE.exists() else DEFAULT_SOURCE
    if not source.exists():
        raise SystemExit(f"Source grid not found: {source}")

    DESIGN_SOURCE.parent.mkdir(parents=True, exist_ok=True)
    if not DESIGN_SOURCE.exists():
        shutil.copy2(source, DESIGN_SOURCE)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    grid = Image.open(source)

    for row, tier in enumerate(TIERS):
        for col, skill in enumerate(SKILLS):
            cell = crop_cell(grid, col, row)
            cell = white_to_alpha(cell)
            out = OUT_DIR / f"{skill}-{tier}.png"
            cell.save(out, format="PNG", optimize=True)
            print(f"wrote {out.relative_to(ROOT)}")

    print("Done — vocabulary-* SVG placeholders unchanged.")


if __name__ == "__main__":
    main()
