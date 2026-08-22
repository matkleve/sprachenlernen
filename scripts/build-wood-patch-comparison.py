#!/usr/bin/env python3
"""Montage: original patches (top) vs FFT-synthesized finals (bottom)."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PATCH_DIR = ROOT / "design/progression/patches"
SYNTH_DIR = ROOT / "design/progression/synthesized"
OUT = ROOT / "design/progression/wood-patch-comparison.png"

LABEL_H = 28
GAP = 4
PAD = 8
COUNT = 6


def load_cell(path: Path, size: tuple[int, int]) -> Image.Image:
    img = Image.open(path).convert("RGB")
    return img.resize(size, Image.Resampling.LANCZOS)


def main() -> None:
    patch_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else PATCH_DIR
    synth_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else SYNTH_DIR
    out = Path(sys.argv[3]) if len(sys.argv) > 3 else OUT

    sample = Image.open(patch_dir / "wood-01.png")
    cell_w, cell_h = sample.size

    cols = 3
    rows_panel = 2
    panel_h = LABEL_H + rows_panel * cell_h + (rows_panel - 1) * GAP
    width = PAD * 2 + cols * cell_w + (cols - 1) * GAP
    height = PAD * 2 + panel_h * 2 + GAP

    canvas = Image.new("RGB", (width, height), (32, 32, 32))
    draw = ImageDraw.Draw(canvas)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
    except OSError:
        font = ImageFont.load_default()

    def paste_row(label: str, y_base: int, suffix: str, directory: Path) -> None:
        draw.text((PAD, y_base), label, fill=(220, 220, 220), font=font)
        y = y_base + LABEL_H
        for i in range(1, COUNT + 1):
            col = (i - 1) % cols
            row = (i - 1) // cols
            x = PAD + col * (cell_w + GAP)
            yy = y + row * (cell_h + GAP)
            path = directory / f"wood-{i:02d}{suffix}"
            canvas.paste(load_cell(path, (cell_w, cell_h)), (x, yy))

    paste_row("Source patches (tight crop)", PAD, ".png", patch_dir)
    paste_row("FFT synthesized (_final)", PAD + panel_h + GAP, "_final.png", synth_dir)

    out.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out)
    print(f"wrote {out} ({width}x{height})")


if __name__ == "__main__":
    main()
