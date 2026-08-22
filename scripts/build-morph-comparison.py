#!/usr/bin/env python3
"""Side-by-side: procedural stripes vs morphological valleys vs photo-extracted cracks."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "design/progression/rim-comparison"


def load(path: Path, size: tuple[int, int], mode: str = "RGB") -> Image.Image:
    return Image.open(path).convert(mode).resize(size, Image.Resampling.LANCZOS)


def main() -> None:
    name = sys.argv[1] if len(sys.argv) > 1 else "wood-01"
    out_dir = OUT_DIR

    columns = [
        ("procedural stripes", [
            f"{name}_procedural_crack_procedural.png",
            f"{name}_procedural_shading.png",
            f"{name}_procedural_final.png",
        ]),
        ("morph v3 blobs", [
            f"{name}_morph3_crack_morphological.png",
            f"{name}_morph3_shading.png",
            f"{name}_morph3_final.png",
        ]),
        ("morph v4 valleys", [
            f"{name}_morph4_crack_morphological.png",
            f"{name}_morph4_shading.png",
            f"{name}_morph4_final.png",
        ]),
        ("extracted photo", [
            f"{name}_extracted_crack_sparse.png",
            f"{name}_extracted_shading.png",
            f"{name}_extracted_final.png",
        ]),
    ]
    row_labels = ["crack mask", "shading + rim", "final color"]

    sample = Image.open(out_dir / columns[2][1][0])
    cell_w, cell_h = sample.size
    label_h = 20
    header_h = 22
    gap = 8
    pad = 12
    cols = len(columns)
    rows_n = len(row_labels)
    width = pad * 2 + cols * cell_w + (cols - 1) * gap
    height = pad * 2 + header_h + rows_n * (label_h + cell_h) + (rows_n - 1) * gap

    canvas = Image.new("RGB", (width, height), (24, 24, 24))
    draw = ImageDraw.Draw(canvas)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 12)
        font_b = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 12)
    except OSError:
        font = font_b = ImageFont.load_default()

    for col_i, (header, files) in enumerate(columns):
        x = pad + col_i * (cell_w + gap)
        draw.text((x, pad), header, fill=(210, 210, 210), font=font_b)
        for row_i, (row_label, fname) in enumerate(zip(row_labels, files)):
            y = pad + header_h + row_i * (label_h + cell_h + gap)
            draw.text((x, y), row_label, fill=(130, 130, 130), font=font)
            path = out_dir / fname
            if not path.exists():
                continue
            mode = "L" if "crack" in fname or "shading" in fname else "RGB"
            canvas.paste(load(path, (cell_w, cell_h), mode), (x, y + label_h))

    out = out_dir / f"{name}_morph_comparison.png"
    canvas.save(out)
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
