#!/usr/bin/env python3
"""Build spiral-learning logo SVGs as pure vector paths (no raster).

Source reference: design/logo/sources/logo-exploration-grid-2026-08-18.png, cell #9.
"""

from __future__ import annotations

import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "design/logo/directions"

CANVAS = "#f7f4ef"
ACCENT = "#b4532a"
ACCENT_DEEP = "#8f3f1f"
INK = "#2c2419"


def spiral(cx: float, cy: float, a: float, b: float, t0: float, t1: float, n: int = 56, rot: float = 0) -> list[tuple[float, float]]:
    pts: list[tuple[float, float]] = []
    for i in range(n):
        t = t0 + (t1 - t0) * i / (n - 1)
        r = a + b * t
        pts.append((cx + r * math.cos(t + rot), cy + r * math.sin(t + rot)))
    return pts


def offset(pts: list[tuple[float, float]], w: float) -> list[tuple[float, float]]:
    out: list[tuple[float, float]] = []
    for i, (x, y) in enumerate(pts):
        if i == 0:
            dx, dy = pts[1][0] - x, pts[1][1] - y
        elif i == len(pts) - 1:
            dx, dy = x - pts[-2][0], y - pts[-2][1]
        else:
            dx = pts[i + 1][0] - pts[i - 1][0]
            dy = pts[i + 1][1] - pts[i - 1][1]
        length = math.hypot(dx, dy) or 1.0
        out.append((x - w * dy / length, y + w * dx / length))
    return out


def path_d(pts: list[tuple[float, float]]) -> str:
    parts = [f"M {pts[0][0]:.1f} {pts[0][1]:.1f}"]
    parts.extend(f"L {x:.1f} {y:.1f}" for x, y in pts[1:])
    return " ".join(parts)


def stroke_path(pts: list[tuple[float, float]], color: str, width: float, opacity: float = 1) -> str:
    opacity_attr = f' stroke-opacity="{opacity}"' if opacity < 1 else ""
    return (
        f'  <path fill="none" stroke="{color}" stroke-width="{width:.0f}"'
        f' stroke-linecap="round" stroke-linejoin="round"{opacity_attr} d="{path_d(pts)}"/>'
    )


def shapes() -> tuple[list[tuple[float, float]], list[tuple[float, float]]]:
    # Tuned to grid #9: compact spiral, opening toward bottom-left, inside maskable safe zone.
    center = spiral(262, 248, 4, 17.5, 0.35, 1.05 * 2 * math.pi, rot=-0.55)
    return offset(center, 7), offset(center, -6)


def wrap(paths: str, label: str, background: str | None = CANVAS) -> str:
    bg = f'  <rect width="512" height="512" rx="96" fill="{background}"/>\n' if background else ""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="{label}">\n'
        f"{bg}{paths}\n"
        "</svg>\n"
    )


def main() -> None:
    orange_line, dark_line = shapes()
    colored = (
        stroke_path(orange_line, ACCENT, 38)
        + "\n"
        + stroke_path(dark_line, ACCENT_DEEP, 24)
    )
    mono = stroke_path(orange_line, INK, 38) + "\n" + stroke_path(dark_line, INK, 24, opacity=0.72)

    files = {
        "spiral-learning.svg": wrap(colored, "Sprachenlernen spiral learning"),
        "spiral-learning-mono.svg": wrap(mono, "Sprachenlernen spiral learning (mono)", None),
        "spiral-learning-app-icon.svg": wrap(colored, "Sprachenlernen app icon"),
    }

    OUT.mkdir(parents=True, exist_ok=True)
    for name, content in files.items():
        (OUT / name).write_text(content)
        print(f"wrote {OUT / name}")


if __name__ == "__main__":
    main()
