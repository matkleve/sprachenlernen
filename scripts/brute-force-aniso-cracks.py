#!/usr/bin/env python3
"""Brute-force N anisotropic crack-mask variants and build a labeled montage grid.

Usage:
    python3 scripts/brute-force-aniso-cracks.py [count] [source.png] [out_dir]

Defaults: 100 variants, wood-01 patch size, design/progression/crack-mask-tries/brute100/
"""

from __future__ import annotations

import importlib.util
import sys
import time
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SYNTH_PATH = ROOT / "scripts/wood-grain-fourier-synthesis.py"
DEFAULT_SOURCE = ROOT / "design/progression/patches/wood-01.png"
DEFAULT_OUT = ROOT / "design/progression/crack-mask-tries/brute100"
ARTIFACTS = Path("/opt/cursor/artifacts")


def _load_synth():
    spec = importlib.util.spec_from_file_location("wood_synth", SYNTH_PATH)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _crack_bw(crack: np.ndarray) -> Image.Image:
    peak = float(crack.max())
    if peak <= 0:
        data = np.full(crack.shape, 255, dtype=np.uint8)
    else:
        data = (255 - np.clip(crack / peak * 255, 0, 255)).astype(np.uint8)
    return Image.fromarray(data, mode="L")


def _variant_params(index: int) -> dict:
    """Spread seeds and knobs across 100 distinct configs."""
    seed = (index * 7919 + 104729) % (2**31 - 1)
    fine_keep = 78.0 + (index % 17)  # 78–94
    major_sigma = 36.0 + (index % 12) * 4.0  # coarse_sigma_x → major_scale ~0.86–1.14
    coarse_strength = 0.65 + (index % 7) * 0.08  # 0.65–1.01
    fine_mix = 0.38 + (index % 9) * 0.04  # 0.38–0.70
    n_fine_base = 55 + (index % 11) * 8  # 55–127
    supersample = 3 if index % 5 == 0 else 4
    return {
        "seed": seed,
        "fine_keep_percentile": fine_keep,
        "coarse_sigma_x": major_sigma,
        "coarse_strength": coarse_strength,
        "fine_mix": fine_mix,
        "n_fine_base": n_fine_base,
        "supersample": supersample,
    }


def _label(index: int, params: dict) -> str:
    return (
        f"#{index:02d} s={params['seed'] % 10000} "
        f"k={params['fine_keep_percentile']:.0f} "
        f"m={params['coarse_sigma_x']:.0f} "
        f"c={params['coarse_strength']:.2f}"
    )


def build_montage(
    tiles: list[tuple[str, Image.Image]],
    *,
    cols: int,
    thumb: int,
    label_h: int,
) -> Image.Image:
    rows = (len(tiles) + cols - 1) // cols
    cell_w = thumb
    cell_h = thumb + label_h
    montage = Image.new("RGB", (cols * cell_w, rows * cell_h), (24, 24, 24))
    draw_ctx = ImageDraw.Draw(montage)
    for i, (label, im) in enumerate(tiles):
        row, col = divmod(i, cols)
        x = col * cell_w
        y = row * cell_h
        thumb_im = im.resize((thumb, thumb), Image.Resampling.LANCZOS)
        montage.paste(thumb_im.convert("RGB"), (x, y))
        draw_ctx.text((x + 2, y + thumb + 1), label, fill=(200, 200, 200))
    return montage


def main() -> None:
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 100
    source = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_SOURCE
    out_dir = Path(sys.argv[3]) if len(sys.argv) > 3 else DEFAULT_OUT

    synth = _load_synth()
    img = Image.open(source)
    h, w = img.size[1], img.size[0]

    out_dir.mkdir(parents=True, exist_ok=True)
    ARTIFACTS.mkdir(parents=True, exist_ok=True)

    tiles: list[tuple[str, Image.Image]] = []
    t0 = time.perf_counter()

    for i in range(count):
        params = _variant_params(i)
        rng = np.random.default_rng(params["seed"])
        field = synth.anisotropic_multiscale_crack_field(
            h,
            w,
            rng,
            fine_keep_percentile=params["fine_keep_percentile"],
            coarse_sigma_x=params["coarse_sigma_x"],
            coarse_strength=params["coarse_strength"],
            fine_mix=params["fine_mix"],
            n_fine_base=params["n_fine_base"],
            supersample=params["supersample"],
        )
        bw = _crack_bw(field)
        tag = f"aniso_brute_{i:03d}"
        bw.save(out_dir / f"{tag}.png")
        label = _label(i, params)
        tiles.append((label, bw))
        if (i + 1) % 10 == 0 or i == 0:
            elapsed = time.perf_counter() - t0
            print(f"[{i + 1}/{count}] {tag} ({elapsed:.1f}s)")

    montage_10 = build_montage(tiles, cols=10, thumb=140, label_h=22)
    montage_10.save(ARTIFACTS / "aniso_brute100_montage_10x10.png")
    montage_10.save(out_dir / "montage_10x10.png")

    # Wider overview: 20×5 for easier horizontal scan
    montage_20 = build_montage(tiles, cols=20, thumb=96, label_h=18)
    montage_20.save(ARTIFACTS / "aniso_brute100_montage_20x5.png")

    elapsed = time.perf_counter() - t0
    print(
        f"Done {count} masks in {elapsed:.1f}s -> {out_dir}\n"
        f"Montages: {ARTIFACTS / 'aniso_brute100_montage_10x10.png'}"
    )


if __name__ == "__main__":
    main()
