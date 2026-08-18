#!/usr/bin/env python3
"""Build spiral-learning logo SVGs from the owner-provided source mark.

Traces the transparent PNG into filled vector paths (no embedded raster).
Source: design/logo/sources/spiral-learning-source.png
"""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "design/logo/sources/spiral-learning-source.png"
ASSET_FALLBACK = (
    Path.home()
    / ".cursor/projects/home-matthias-Projects-sprachenlernen/assets"
    / "spiral_learning_transparent_1_-7b0961d2-7cdc-4a8a-9b4e-dad69c77a0bc.png"
)
OUT = ROOT / "design/logo/directions"
PUBLIC = ROOT / "public/design/logo/directions"

CANVAS = "#f7f4ef"
ACCENT = "#b4532a"
ACCENT_DEEP = "#8f3f1f"
INK = "#2c2419"

ARTBOARD = 512
SAFE = 400  # maskable safe zone diameter


def refresh_source() -> None:
    if not ASSET_FALLBACK.exists():
        return
    img = Image.open(ASSET_FALLBACK).convert("RGBA")
    side = max(img.size)
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    square.paste(img, ((side - img.width) // 2, (side - img.height) // 2), img)
    scaled = square.resize((SAFE, SAFE), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (ARTBOARD, ARTBOARD), (0, 0, 0, 0))
    offset = (ARTBOARD - SAFE) // 2
    canvas.paste(scaled, (offset, offset), scaled)
    SOURCE.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(SOURCE)


def classify(r: int, g: int, b: int, a: int) -> str | None:
    if a < 48:
        return None
    if r - max(g, b) >= 28:
        return "orange"
    if r >= 40 and g < 70 and b < 50:
        return "brown"
    return None


def build_masks(img: Image.Image) -> dict[str, list[list[bool]]]:
    w, h = img.size
    masks = {
        "orange": [[False] * w for _ in range(h)],
        "brown": [[False] * w for _ in range(h)],
    }
    for y in range(h):
        for x in range(w):
            label = classify(*img.getpixel((x, y)))
            if label:
                masks[label][y][x] = True
    return masks


def fill_holes(mask: list[list[bool]]) -> list[list[bool]]:
    h = len(mask)
    w = len(mask[0]) if h else 0
    outside = [[False] * w for _ in range(h)]

    stack: list[tuple[int, int]] = []
    for x in range(w):
        if not mask[0][x]:
            stack.append((x, 0))
        if not mask[h - 1][x]:
            stack.append((x, h - 1))
    for y in range(h):
        if not mask[y][0]:
            stack.append((0, y))
        if not mask[y][w - 1]:
            stack.append((w - 1, y))

    while stack:
        x, y = stack.pop()
        if x < 0 or y < 0 or x >= w or y >= h or outside[y][x] or mask[y][x]:
            continue
        outside[y][x] = True
        stack.extend([(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])

    return [[mask[y][x] or not outside[y][x] for x in range(w)] for y in range(h)]


def largest_component(mask: list[list[bool]]) -> list[list[bool]]:
    h = len(mask)
    w = len(mask[0]) if h else 0
    seen = [[False] * w for _ in range(h)]
    best: list[tuple[int, int]] = []

    for y in range(h):
        for x in range(w):
            if not mask[y][x] or seen[y][x]:
                continue
            stack = [(x, y)]
            component: list[tuple[int, int]] = []
            seen[y][x] = True
            while stack:
                cx, cy = stack.pop()
                component.append((cx, cy))
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < w and 0 <= ny < h and mask[ny][nx] and not seen[ny][nx]:
                        seen[ny][nx] = True
                        stack.append((nx, ny))
            if len(component) > len(best):
                best = component

    out = [[False] * w for _ in range(h)]
    for x, y in best:
        out[y][x] = True
    return out


def trace_boundary(mask: list[list[bool]]) -> list[tuple[int, int]]:
    h = len(mask)
    w = len(mask[0]) if h else 0
    # Find start pixel on outer edge (top-leftmost boundary pixel).
    start: tuple[int, int] | None = None
    for y in range(h):
        for x in range(w):
            if mask[y][x]:
                start = (x, y)
                break
        if start:
            break
    if not start:
        return []

    # Moore-neighbor contour tracing (clockwise).
    directions = [(1, 0), (1, 1), (0, 1), (-1, 1), (-1, 0), (-1, -1), (0, -1), (1, -1)]
    x, y = start
    boundary = [(x, y)]
    prev_dir = 6
    guard = 0
    while guard < w * h * 8:
        guard += 1
        found = False
        for step in range(8):
            dir_idx = (prev_dir + step) % 8
            dx, dy = directions[dir_idx]
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and mask[ny][nx]:
                x, y = nx, ny
                prev_dir = (dir_idx + 6) % 8
                if (x, y) == start and len(boundary) > 2:
                    return boundary
                boundary.append((x, y))
                found = True
                break
        if not found:
            break
    return boundary


def simplify(points: list[tuple[int, int]], epsilon: float = 1.8) -> list[tuple[int, int]]:
    if len(points) < 3:
        return points

    def perp_dist(point: tuple[int, int], a: tuple[int, int], b: tuple[int, int]) -> float:
        x0, y0 = point
        x1, y1 = a
        x2, y2 = b
        dx, dy = x2 - x1, y2 - y1
        if dx == 0 and dy == 0:
            return math.hypot(x0 - x1, y0 - y1)
        t = ((x0 - x1) * dx + (y0 - y1) * dy) / (dx * dx + dy * dy)
        t = max(0.0, min(1.0, t))
        px, py = x1 + t * dx, y1 + t * dy
        return math.hypot(x0 - px, y0 - py)

    def rdp(pts: list[tuple[int, int]]) -> list[tuple[int, int]]:
        if len(pts) < 3:
            return pts
        a, b = pts[0], pts[-1]
        idx = max(range(1, len(pts) - 1), key=lambda i: perp_dist(pts[i], a, b))
        if perp_dist(pts[idx], a, b) <= epsilon:
            return [a, b]
        left = rdp(pts[: idx + 1])
        right = rdp(pts[idx:])
        return left[:-1] + right

    closed = points[:] + [points[0]]
    return rdp(closed)[:-1]


def path_d(points: list[tuple[int, int]]) -> str:
    if not points:
        return ""
    parts = [f"M {points[0][0]:.1f} {points[0][1]:.1f}"]
    parts.extend(f"L {x:.1f} {y:.1f}" for x, y in points[1:])
    parts.append("Z")
    return " ".join(parts)


def traced_paths(img: Image.Image) -> tuple[str, str]:
    masks = build_masks(img)
    orange_pts = simplify(trace_boundary(fill_holes(largest_component(masks["orange"]))), epsilon=2.4)
    brown_pts = simplify(trace_boundary(fill_holes(largest_component(masks["brown"]))), epsilon=2.4)
    return path_d(orange_pts), path_d(brown_pts)


def wrap(paths: str, label: str, background: str | None = CANVAS) -> str:
    bg = f'  <rect width="{ARTBOARD}" height="{ARTBOARD}" rx="96" fill="{background}"/>\n' if background else ""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {ARTBOARD} {ARTBOARD}" role="img" aria-label="{label}">\n'
        f"{bg}{paths}\n"
        "</svg>\n"
    )


def main() -> None:
    refresh_source()
    if not SOURCE.exists():
        raise SystemExit(f"Missing source: {SOURCE}")

    img = Image.open(SOURCE).convert("RGBA")
    orange_d, brown_d = traced_paths(img)

    colored = (
        f'  <path fill="{ACCENT}" d="{orange_d}"/>\n'
        f'  <path fill="{ACCENT_DEEP}" d="{brown_d}"/>'
    )
    mono = (
        f'  <path fill="{INK}" d="{orange_d}"/>\n'
        f'  <path fill="{INK}" fill-opacity="0.72" d="{brown_d}"/>'
    )

    files = {
        "spiral-learning.svg": wrap(colored, "Sprachenlernen spiral learning"),
        "spiral-learning-mono.svg": wrap(mono, "Sprachenlernen spiral learning (mono)", None),
        "spiral-learning-app-icon.svg": wrap(colored, "Sprachenlernen app icon"),
    }

    OUT.mkdir(parents=True, exist_ok=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)
    for name, content in files.items():
        (OUT / name).write_text(content)
        (PUBLIC / name).write_text(content)
        print(f"wrote {OUT / name}")


if __name__ == "__main__":
    main()
