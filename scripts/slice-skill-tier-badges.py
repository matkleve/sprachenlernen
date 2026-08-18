#!/usr/bin/env python3
"""Slice the 4×5 skill-tier badge grid into PNG assets with background keyed out."""

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
DESIGN_SOURCE_V2 = ROOT / "design/skill-tier-badges/source-grid-v2.png"
DESIGN_SOURCE_ORNATE = ROOT / "design/skill-tier-badges/source-grid-ornate.png"
OUT_DIR = ROOT / "public/assets/skill-tier-badges"

SKILLS = ["reading", "listening", "speaking", "writing"]
TIERS = ["wood", "bronze", "silver", "gold", "platinum"]

# Trim gutters inside the uniform grid (tune once per source art).
MARGIN_X = 0.08
MARGIN_Y = 0.08
GUTTER_X = 0.02
GUTTER_Y = 0.03

# Normalised output — shield floats inside canvas so card render never clips tips.
OUTPUT_SIZE = 256
CONTENT_FILL = 0.58


def key_background_to_alpha(image: Image.Image) -> Image.Image:
    """Remove white or black sheet backgrounds — ornate grids ship on black."""
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if (r >= 238 and g >= 238 and b >= 238) or (r <= 35 and g <= 35 and b <= 35):
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


def normalize_badge(cell: Image.Image) -> Image.Image:
    """Centre shield on a square canvas — tips stay inside alpha bounds."""
    cell = key_background_to_alpha(cell)
    bbox = cell.split()[3].getbbox()
    if not bbox:
        return cell

    content = cell.crop(bbox)
    cw, ch = content.size
    target = int(OUTPUT_SIZE * CONTENT_FILL)
    scale = min(target / cw, target / ch)
    nw, nh = max(1, int(cw * scale)), max(1, int(ch * scale))
    content = content.resize((nw, nh), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (OUTPUT_SIZE, OUTPUT_SIZE), (0, 0, 0, 0))
    canvas.paste(content, ((OUTPUT_SIZE - nw) // 2, (OUTPUT_SIZE - nh) // 2), content)
    return canvas


def pick_source() -> Path:
    for candidate in (
        DESIGN_SOURCE_ORNATE,
        DESIGN_SOURCE_V2,
        DESIGN_SOURCE,
        DEFAULT_SOURCE,
    ):
        if candidate.exists():
            return candidate
    raise SystemExit("Source grid not found")


def main() -> None:
    source = pick_source()
    DESIGN_SOURCE.parent.mkdir(parents=True, exist_ok=True)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    grid = Image.open(source)
    print(f"source {source.relative_to(ROOT)}")

    for row, tier in enumerate(TIERS):
        for col, skill in enumerate(SKILLS):
            cell = crop_cell(grid, col, row)
            cell = normalize_badge(cell)
            out = OUT_DIR / f"{skill}-{tier}.png"
            cell.save(out, format="PNG", optimize=True)
            print(f"wrote {out.relative_to(ROOT)}")

    print("Done — vocabulary-* SVG placeholders unchanged.")


if __name__ == "__main__":
    main()
