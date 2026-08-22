#!/usr/bin/env python3
"""Overlay measured coarse vs threshold valleys on source — width comparison."""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from lib.wood_valley_threshold import (  # noqa: E402
    luminance_valley_depth,
    morph_coarse_valleys,
    split_threshold_valleys,
)

OUT = Path("/opt/cursor/artifacts/wood-layers")


def load_synth():
    spec = importlib.util.spec_from_file_location(
        "wg", ROOT / "scripts" / "wood-grain-fourier-synthesis.py"
    )
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def overlay_masks(
    rgb: np.ndarray,
    mask_a: np.ndarray,
    mask_b: np.ndarray,
    color_a: tuple[int, int, int],
    color_b: tuple[int, int, int],
    alpha: float = 0.55,
) -> np.ndarray:
    out = rgb.astype(np.float64).copy()
    a = mask_a > 0.2
    b = mask_b > 0.2
    for c, v in enumerate(color_a):
        out[..., c] = np.where(a, out[..., c] * (1 - alpha) + v * alpha, out[..., c])
    for c, v in enumerate(color_b):
        out[..., c] = np.where(b & ~a, out[..., c] * (1 - alpha) + v * alpha, out[..., c])
    both = a & b
    for c in range(3):
        out[..., c] = np.where(both, out[..., c] * (1 - alpha) + 220 * alpha, out[..., c])
    return np.clip(out, 0, 255).astype(np.uint8)


def profile_slice(img: np.ndarray, y: int, label: str, out_path: Path) -> None:
    import matplotlib.pyplot as plt

    row = img[y] if img.ndim == 1 else img[y].mean(axis=-1) if img.ndim == 3 else img[y]
    fig, ax = plt.subplots(figsize=(10, 2.2))
    ax.plot(row, color="#8b6914", linewidth=1)
    ax.set_title(f"Row {y} — {label}")
    ax.set_xlim(0, len(row))
    ax.set_ylim(0, 1)
    fig.savefig(out_path, dpi=120, bbox_inches="tight")
    plt.close(fig)


def main(source: Path) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    wg = load_synth()
    rgb = np.asarray(Image.open(source).convert("RGB"), dtype=np.uint8)
    height = np.asarray(Image.open(source).convert("L"), dtype=float)

    _, vc_env = wg.extract_valley_layers(height)
    vc_n = vc_env / (vc_env.max() + 1e-8)

    thr_fine, thr_coarse = split_threshold_valleys(height, fine_quantile=0.22, coarse_quantile=0.10)
    thr_lum = luminance_valley_depth(height, dark_quantile=0.12)
    morph_c = morph_coarse_valleys(height, dark_quantile=0.12, min_width=7)

    # overlays
    ov1 = overlay_masks(rgb, thr_coarse, vc_n, (0, 220, 80), (220, 40, 40))
    img1 = Image.fromarray(ov1)
    draw = ImageDraw.Draw(img1)
    draw.text((8, 8), "GREEN=threshold coarse  RED=measured coarse  YELLOW=overlap", fill=(255, 255, 255))
    img1.save(OUT / "wood-01-overlay-threshold-vs-measured-coarse.png")

    ov2 = overlay_masks(rgb, thr_lum, vc_n, (0, 200, 255), (220, 40, 40))
    Image.fromarray(ov2).save(OUT / "wood-01-overlay-threshold-lum-vs-envelope.png")

    ov3 = overlay_masks(rgb, morph_c, vc_n, (180, 80, 255), (220, 40, 40))
    Image.fromarray(ov3).save(OUT / "wood-01-overlay-morph-vs-envelope.png")

    # 2x2 compare depth maps
    cell = 400
    maps = [
        ("threshold coarse (q=0.10)", thr_coarse),
        ("measured coarse (envelope)", vc_n),
        ("threshold luminance (q=0.12)", thr_lum),
        ("morph wide cracks", morph_c),
    ]
    grid = Image.new("RGB", (cell * 2 + 24, cell * 2 + 60), (20, 20, 20))
    draw = ImageDraw.Draw(grid)
    for i, (lab, arr) in enumerate(maps):
        r, c = divmod(i, 2)
        x = 8 + c * (cell + 8)
        y = 28 + r * (cell + 28)
        im = Image.fromarray((np.clip(arr, 0, 1) * 255).astype(np.uint8), mode="L").convert("RGB")
        grid.paste(im.resize((cell, cell), Image.Resampling.LANCZOS), (x, y))
        draw.text((x, y - 20), lab, fill=(230, 230, 230))
    grid.save(OUT / "wood-01-valley-extraction-compare.png")

    # profile through main fissure band
    y = 242
    profile_slice(height / 255, y, "source luminance", OUT / "wood-01-profile-source-L.png")
    profile_slice(thr_coarse, y, "threshold coarse depth", OUT / "wood-01-profile-threshold-coarse.png")
    profile_slice(vc_n, y, "envelope coarse depth", OUT / "wood-01-profile-envelope-coarse.png")

    # width stats at y
    def max_run(mask):
        xs = np.where(mask)[0]
        if xs.size == 0:
            return 0
        runs = []
        s = xs[0]
        for i in range(1, len(xs)):
            if xs[i] - xs[i - 1] > 1:
                runs.append(xs[i - 1] - s + 1)
                s = xs[i]
        runs.append(xs[-1] - s + 1)
        return max(runs)

    src_dark = (height / height.max()) < np.quantile(height / height.max(), 0.12)
    print(f"row {y} max run width: source dark={max_run(src_dark[y])}px")
    print(f"  threshold coarse={max_run(thr_coarse[y]>0.2)}px  envelope coarse={max_run(vc_n[y]>0.2)}px")
    print(f"Wrote overlays to {OUT}")


if __name__ == "__main__":
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("design/progression/patches/wood-01.png")
    main(src)
