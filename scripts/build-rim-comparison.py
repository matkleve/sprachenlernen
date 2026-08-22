#!/usr/bin/env python3
"""Side-by-side: crack layers, shading with rim vs no-rim."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "design/progression/rim-comparison"
DEFAULT_NAME = "wood-01"
DEFAULT_SCALE = 4


def load_rgb(path: Path, size: tuple[int, int]) -> Image.Image:
    return Image.open(path).convert("RGB").resize(size, Image.Resampling.LANCZOS)


def load_l(path: Path, size: tuple[int, int]) -> Image.Image:
    return Image.open(path).convert("L").resize(size, Image.Resampling.LANCZOS)


def main() -> None:
    name = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_NAME
    scale = int(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_SCALE
    out_dir = OUT_DIR
    tag = f"{name}_scale{scale}"

    crack_layer = out_dir / f"{tag}_crack_layer.png"
    crack_synth = out_dir / f"{tag}_crack_synth_hb_scale{scale}.png"
    shading_rim = out_dir / f"{tag}_shading.png"
    shading_norim = out_dir / f"{tag}_norim_shading.png"
    final_rim = out_dir / f"{tag}_final.png"
    final_norim = out_dir / f"{tag}_norim_final.png"

    sample = Image.open(crack_layer)
    cell_w, cell_h = sample.size

    labels = [
        "crack_layer (extracted)",
        f"crack_synth HB scale{scale}",
        "shading WITH rim",
        "shading NO rim",
        "final WITH rim",
        "final NO rim",
    ]
    paths = [crack_layer, crack_synth, shading_rim, shading_norim, final_rim, final_norim]

    cols, rows = 3, 2
    label_h = 24
    gap = 6
    pad = 10
    width = pad * 2 + cols * cell_w + (cols - 1) * gap
    height = pad * 2 + rows * (label_h + cell_h) + (rows - 1) * gap

    canvas = Image.new("RGB", (width, height), (28, 28, 28))
    draw = ImageDraw.Draw(canvas)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 13)
    except OSError:
        font = ImageFont.load_default()

    for i, (label, path) in enumerate(zip(labels, paths)):
        col = i % cols
        row = i // cols
        x = pad + col * (cell_w + gap)
        y = pad + row * (label_h + cell_h + gap)
        draw.text((x, y), label, fill=(210, 210, 210), font=font)
        img_y = y + label_h
        if "shading" in path.name or "crack" in path.name:
            img = load_l(path, (cell_w, cell_h))
            canvas.paste(img, (x, img_y))
        else:
            canvas.paste(load_rgb(path, (cell_w, cell_h)), (x, img_y))

    out = out_dir / f"{tag}_rim_vs_norim.png"
    canvas.save(out)
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
