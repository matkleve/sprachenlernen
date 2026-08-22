#!/usr/bin/env python3
"""Build fanned-pages logo SVGs from the grid #5 source crop.

Outputs:
  - fanned-pages.svg          orange shapes only (transparent) — UI lockups
  - fanned-pages-mono.svg     ink shapes only (transparent) — mono lockups
  - fanned-pages-app-icon.svg canvas tile + orange shapes — PWA / favicon
"""
from __future__ import annotations

import base64
import io
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "design/logo/sources/fanned-pages-grid5.png"
GRID_SOURCE = (
    Path.home()
    / ".cursor/projects/home-matthias-Projects-sprachenlernen/assets"
    / "ChatGPT_Image_Aug_17__2026__12_15_59_PM-54579ff5-0e09-4256-9527-da5305d456d1.png"
)
OUT_DIR = ROOT / "design/logo/directions"
PUBLIC_DIR = ROOT / "public/design/logo/directions"
CANVAS = "#f7f4ef"
ACCENT = (193, 87, 38)  # grid #5 terracotta — solid fill, not edge-sampled


def refresh_source_crop() -> None:
    """Re-crop cell #5 from the full exploration grid when available."""
    if not GRID_SOURCE.exists():
        return

    img = Image.open(GRID_SOURCE).convert("RGBA")
    width, height = img.size
    cols, rows = 5, 4
    col, row = 4, 0  # cell #5 — top-right of first row
    label_frac = 0.11
    cell_w, cell_h = width // cols, height // rows
    x0, y0 = col * cell_w, row * cell_h
    x1, y1 = x0 + cell_w, y0 + int(cell_h * (1 - label_frac))
    cell = img.crop((x0, y0, x1, y1))

    side = min(cell.size)
    left = (cell.width - side) // 2
    top = (cell.height - side) // 2
    square = cell.crop((left, top, left + side, top + side)).resize(
        (512, 512), Image.Resampling.LANCZOS
    )
    SOURCE.parent.mkdir(parents=True, exist_ok=True)
    square.save(SOURCE)


def orange_alpha(r: int, g: int, b: int) -> int:
    """Keep anti-aliased edge pixels — threshold on orange dominance, not bg distance."""
    if r < 90:
        return 0
    dominance = r - max(g, b)
    if dominance < 18:
        return 0
    if dominance >= 55:
        return 255
    return int(255 * (dominance - 18) / (55 - 18))


def shapes_png(img: Image.Image) -> Image.Image:
    shapes = Image.new("RGBA", img.size, (0, 0, 0, 0))
    spx = shapes.load()
    ipx = img.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, _a = ipx[x, y]
            alpha = orange_alpha(r, g, b)
            if alpha:
                spx[x, y] = (*ACCENT, alpha)

    # Restore edge weight lost to anti-aliasing — 1px dilation on alpha only.
    rgb = Image.new("RGB", img.size, ACCENT)
    alpha = shapes.split()[3].filter(ImageFilter.MaxFilter(3))
    return Image.merge("RGBA", (*rgb.split(), alpha))


def b64_png(image: Image.Image) -> str:
    buf = io.BytesIO()
    image.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()


def image_svg(data_b64: str, label: str) -> str:
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="{label}">
  <image href="data:image/png;base64,{data_b64}" width="512" height="512" />
</svg>
"""


def mono_svg(data_b64: str, label: str) -> str:
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="{label}">
  <defs>
    <filter id="ink" color-interpolation-filters="sRGB">
      <feColorMatrix type="matrix" values="0 0 0 0 0.1725  0 0 0 0 0.1412  0 0 0 0 0.0980  0 0 0 1 0" />
    </filter>
  </defs>
  <image href="data:image/png;base64,{data_b64}" width="512" height="512" filter="url(#ink)" />
</svg>
"""


def app_icon_svg(data_b64: str, label: str) -> str:
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="{label}">
  <rect width="512" height="512" rx="96" fill="{CANVAS}" />
  <image href="data:image/png;base64,{data_b64}" width="512" height="512" />
</svg>
"""


def main() -> None:
    refresh_source_crop()
    if not SOURCE.exists():
        raise SystemExit(f"Missing source crop: {SOURCE}")

    img = Image.open(SOURCE).convert("RGBA")
    shapes = shapes_png(img)

    files = {
        "fanned-pages.svg": image_svg(b64_png(shapes), "Sprachenlernen fanned pages"),
        "fanned-pages-mono.svg": mono_svg(b64_png(shapes), "Sprachenlernen fanned pages mono"),
        "fanned-pages-app-icon.svg": app_icon_svg(b64_png(shapes), "Sprachenlernen app icon"),
    }

    for name, content in files.items():
        for directory in (OUT_DIR, PUBLIC_DIR):
            path = directory / name
            path.write_text(content)
            print(f"wrote {path}")


if __name__ == "__main__":
    main()
