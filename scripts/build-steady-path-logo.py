#!/usr/bin/env python3
"""Build steady-path logo SVGs from exploration grid cell #1 (Steady Path).

Outputs:
  - steady-path.svg          earth + warm stones (transparent) — UI lockups
  - steady-path-mono.svg     ink stones (transparent) — mono lockups
  - steady-path-app-icon.svg canvas tile + stones — PWA / favicon
"""
from __future__ import annotations

import base64
import io
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "design/logo/sources/steady-path-grid1.png"
GRID_SOURCE = (
    Path.home()
    / ".cursor/projects/home-matthias-Projects-sprachenlernen/assets"
    / "ChatGPT_Image_Aug_17__2026__02_35_49_PM-676d6d32-7f4b-454b-ba82-ce8a22c1f620.png"
)
OUT_DIR = ROOT / "design/logo/directions"
PUBLIC_DIR = ROOT / "public/design/logo/directions"
CANVAS = "#f7f4ef"
EARTH = (56, 40, 16)  # #382810 — logo brown
WARM = (192, 80, 32)  # #c05020 — logo terracotta


def refresh_source_crop() -> None:
    if not GRID_SOURCE.exists():
        return

    img = Image.open(GRID_SOURCE).convert("RGBA")
    width, height = img.size
    cols, rows = 4, 5
    col, row = 0, 0  # cell #1 — Steady Path
    icon_height = int(height * 0.72)
    cell_w = width // cols
    cell_h = icon_height // rows
    x0, y0 = col * cell_w, row * cell_h
    x1, y1 = x0 + cell_w, y0 + cell_h
    cell = img.crop((x0, y0, x1, y1))

    side = min(cell.size)
    left = (cell.width - side) // 2
    top = (cell.height - side) // 2
    square = cell.crop((left, top, left + side, top + side)).resize(
        (512, 512), Image.Resampling.LANCZOS
    )
    SOURCE.parent.mkdir(parents=True, exist_ok=True)
    square.save(SOURCE)


def classify(r: int, g: int, b: int) -> tuple[int, int, int] | None:
    if r < 90 and b < 90 and r > g > b and (r - b) > 35:
        return EARTH
    if r > 130 and r > g > b and (r - b) > 50:
        return WARM
    return None


def shapes_png(img: Image.Image) -> Image.Image:
    shapes = Image.new("RGBA", img.size, (0, 0, 0, 0))
    spx = shapes.load()
    ipx = img.load()
    bg = img.getpixel((12, 12))[:3]

    for y in range(img.height):
        for x in range(img.width):
            r, g, b, _a = ipx[x, y]
            if abs(r - bg[0]) + abs(g - bg[1]) + abs(b - bg[2]) < 30:
                continue
            fill = classify(r, g, b)
            if fill:
                spx[x, y] = (*fill, 255)

    alpha = shapes.split()[3].filter(ImageFilter.MaxFilter(3))
    rgb = Image.new("RGB", img.size, (0, 0, 0))
    rgb_px = rgb.load()
    shape_px = shapes.load()
    for y in range(img.height):
        for x in range(img.width):
            if alpha.getpixel((x, y)) > 0:
                rgb_px[x, y] = shape_px[x, y][:3]
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
        "steady-path.svg": image_svg(b64_png(shapes), "Sprachenlernen steady path"),
        "steady-path-mono.svg": mono_svg(b64_png(shapes), "Sprachenlernen steady path mono"),
        "steady-path-app-icon.svg": app_icon_svg(b64_png(shapes), "Sprachenlernen app icon"),
    }

    for name, content in files.items():
        for directory in (OUT_DIR, PUBLIC_DIR):
            path = directory / name
            path.write_text(content)
            print(f"wrote {path}")


if __name__ == "__main__":
    main()
