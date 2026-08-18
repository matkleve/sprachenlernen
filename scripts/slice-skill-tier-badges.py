#!/usr/bin/env python3
"""Slice the 4×5 skill-tier badge grid into PNG assets with background keyed out."""

from __future__ import annotations

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

OUTPUT_SIZE = 256
CONTENT_FILL = 0.58

LEGACY_MARGIN_X = 0.08
LEGACY_MARGIN_Y = 0.08
LEGACY_GUTTER_X = 0.02
LEGACY_GUTTER_Y = 0.03

ALPHA_THRESHOLD = 48
KEY_WHITE_CUTOFF = 28
KEY_WHITE_FEATHER = 52


def key_background_to_alpha(image: Image.Image) -> Image.Image:
    """Remove white or black sheet backgrounds — ornate grids ship on black."""
    rgba = image.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            dist = max(255 - r, 255 - g, 255 - b)
            if dist <= KEY_WHITE_CUTOFF:
                pixels[x, y] = (r, g, b, 0)
            elif dist <= KEY_WHITE_FEATHER:
                alpha = int((dist - KEY_WHITE_CUTOFF) * 255 / (KEY_WHITE_FEATHER - KEY_WHITE_CUTOFF))
                pixels[x, y] = (r, g, b, alpha)
    return rgba


def crop_cell_legacy(image: Image.Image, col: int, row: int) -> Image.Image:
    width, height = image.size
    cell_w = width / len(SKILLS)
    cell_h = height / len(TIERS)

    left = col * cell_w + cell_w * LEGACY_MARGIN_X
    top = row * cell_h + cell_h * LEGACY_MARGIN_Y
    right = (col + 1) * cell_w - cell_w * LEGACY_MARGIN_X
    bottom = (row + 1) * cell_h - cell_h * LEGACY_GUTTER_Y

    if col > 0:
        left += cell_w * LEGACY_GUTTER_X / 2
    if col < len(SKILLS) - 1:
        right -= cell_w * LEGACY_GUTTER_X / 2
    if row > 0:
        top += cell_h * LEGACY_GUTTER_Y / 2
    if row < len(TIERS) - 1:
        bottom -= cell_h * LEGACY_GUTTER_Y / 2

    return image.crop((int(left), int(top), int(right), int(bottom)))


def _column_counts(
    keyed: Image.Image,
    min_x: int,
    min_y: int,
    max_x: int,
    max_y: int,
) -> list[int]:
    alpha = keyed.split()[3]
    ap = alpha.load()
    cx = (min_x + max_x) // 2
    half_w = max(20, int((max_x - min_x) * 0.3))
    x0 = max(0, cx - half_w)
    x1 = min(keyed.size[0] - 1, cx + half_w)
    return [
        sum(1 for x in range(x0, x1 + 1) if ap[x, y] >= ALPHA_THRESHOLD)
        for y in range(min_y, max_y + 1)
    ]


def _trim_vertical_bleed(
    keyed: Image.Image,
    bbox: tuple[int, int, int, int],
) -> tuple[int, int, int, int]:
    """Drop the next-tier bleed connected through row gutters (gold vs platinum)."""
    min_x, min_y, max_x, max_y = bbox
    counts = _column_counts(keyed, min_x, min_y, max_x, max_y)
    if not counts:
        return bbox

    peak = max(counts)
    floor = max(12, int(peak * 0.28))

    trim_max = max_y
    state = "bottom_bleed"
    for i in range(len(counts) - 1, -1, -1):
        c = counts[i]
        if state == "bottom_bleed":
            if c < floor:
                state = "valley"
        elif state == "valley":
            if c >= floor:
                trim_max = min_y + i
                break

    trim_min = min_y
    state = "top_bleed"
    for i, c in enumerate(counts):
        if state == "top_bleed":
            if c < floor:
                state = "valley"
        elif state == "valley":
            if c >= floor:
                trim_min = min_y + i
                break

    if trim_min > trim_max:
        return bbox
    return (min_x, trim_min, max_x, trim_max)


def _opaque_bbox(keyed: Image.Image) -> tuple[int, int, int, int] | None:
    alpha = keyed.split()[3]
    bbox = alpha.getbbox()
    if bbox is None:
        return None
    return bbox


def _split_row_blobs(keyed_row: Image.Image) -> list[tuple[int, int, int, int]]:
    """Return up to four opaque blobs in a row band, sorted left-to-right."""
    width, height = keyed_row.size
    alpha = keyed_row.split()[3]
    ap = alpha.load()
    visited = [[False] * width for _ in range(height)]
    blobs: list[tuple[int, int, int, int, int]] = []

    for y in range(height):
        for x in range(width):
            if visited[y][x] or ap[x, y] < ALPHA_THRESHOLD:
                continue
            stack = [(x, y)]
            visited[y][x] = True
            min_x, min_y, max_x, max_y = x, y, x, y
            sum_x = 0
            count = 0
            while stack:
                cx, cy = stack.pop()
                sum_x += cx
                count += 1
                for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)):
                    if 0 <= nx < width and 0 <= ny < height and not visited[ny][nx]:
                        if ap[nx, ny] >= ALPHA_THRESHOLD:
                            visited[ny][nx] = True
                            stack.append((nx, ny))
                            min_x = min(min_x, nx)
                            max_x = max(max_x, nx)
                            min_y = min(min_y, ny)
                            max_y = max(max_y, ny)
            width_blob = max_x - min_x + 1
            height_blob = max_y - min_y + 1
            if width_blob < 90 or height_blob < 70 or width_blob * height_blob < 9000:
                continue
            blobs.append((min_x, min_y, max_x, max_y, sum_x // count))

    blobs.sort(key=lambda b: b[4])
    return [(b[0], b[1], b[2], b[3]) for b in blobs[:len(SKILLS)]]


def crop_cell_v2(image: Image.Image, col: int, row: int) -> Image.Image:
    """Detect four badge blobs per row — v2 grid columns are not edge-aligned."""
    width, height = image.size
    cell_h = height / len(TIERS)
    y0 = int(row * cell_h)
    y1 = int((row + 1) * cell_h)
    pad_into_prev = int(cell_h * 0.14) if row > 0 else 0

    row_rgb = image.crop((0, max(0, y0 - pad_into_prev), width, y1))
    keyed_row = key_background_to_alpha(row_rgb)
    blobs = _split_row_blobs(keyed_row)

    if len(blobs) < len(SKILLS):
        return crop_cell_legacy(image, col, row)

    min_x, min_y, max_x, max_y = blobs[col]
    trimmed = _trim_vertical_bleed(keyed_row, (min_x, min_y, max_x, max_y))
    if trimmed[3] >= trimmed[1] and trimmed[2] >= trimmed[0]:
        min_x, min_y, max_x, max_y = trimmed
    pad = max(3, int(cell_h * 0.03))
    crop_box = (
        max(0, min_x - pad),
        max(0, min_y - pad),
        min(keyed_row.size[0], max_x + pad + 1),
        min(keyed_row.size[1], max_y + pad + 1),
    )
    return keyed_row.crop(crop_box)


def crop_cell(image: Image.Image, col: int, row: int, *, v2: bool) -> Image.Image:
    if v2:
        return crop_cell_v2(image, col, row)
    return crop_cell_legacy(image, col, row)


def normalize_badge(cell: Image.Image) -> Image.Image:
    """Centre shield on a square canvas — tips stay inside alpha bounds."""
    if cell.mode != "RGBA":
        cell = key_background_to_alpha(cell)
    bbox = _opaque_bbox(cell)
    if bbox is None:
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
        DESIGN_SOURCE_V2,
        DESIGN_SOURCE_ORNATE,
        DESIGN_SOURCE,
        DEFAULT_SOURCE,
    ):
        if candidate.exists():
            return candidate
    raise SystemExit("Source grid not found")


def main() -> None:
    source = pick_source()
    DESIGN_SOURCE.parent.mkdir(parents=True, exist_ok=True)
    v2 = source.resolve() == DESIGN_SOURCE_V2.resolve()

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    grid = Image.open(source)
    print(f"source {source.relative_to(ROOT)} (v2={v2})")

    for row, tier in enumerate(TIERS):
        for col, skill in enumerate(SKILLS):
            cell = crop_cell(grid, col, row, v2=v2)
            cell = normalize_badge(cell)
            out = OUT_DIR / f"{skill}-{tier}.png"
            cell.save(out, format="PNG", optimize=True)
            print(f"wrote {out.relative_to(ROOT)}")

    print("Done — vocabulary-* SVG placeholders unchanged.")


if __name__ == "__main__":
    main()
