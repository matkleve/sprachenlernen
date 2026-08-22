#!/usr/bin/env python3
"""Greyscale layers for WEATHERED LONGITUDINAL PLANK wood (no rings).

Target: design/wood-grain-fourier/sources/real-wood-reference-comparison.png
Structure: horizontal fibres + sparse dark fissures + fine striations.
"""

from __future__ import annotations

import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter


SIZE = 512
SEED = 7


def hash2(x: np.ndarray, y: np.ndarray, seed: float) -> np.ndarray:
    return (np.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123) % 1.0


def smoothstep(t: np.ndarray) -> np.ndarray:
    return t * t * (3 - 2 * t)


def value_noise(x: np.ndarray, y: np.ndarray, seed: float) -> np.ndarray:
    x0, y0 = np.floor(x), np.floor(y)
    tx, ty = smoothstep(x - x0), smoothstep(y - y0)
    a, b = hash2(x0, y0, seed), hash2(x0 + 1, y0, seed)
    c, d = hash2(x0, y0 + 1, seed), hash2(x0 + 1, y0 + 1, seed)
    ab, cd = a + (b - a) * tx, c + (d - c) * tx
    return ab + (cd - ab) * ty


def fbm(x: np.ndarray, y: np.ndarray, seed: float, octaves: int = 5, gain: float = 0.5) -> np.ndarray:
    amp, freq, total, norm = 0.5, 1.0, np.zeros_like(x), 0.0
    for i in range(octaves):
        total += amp * value_noise(x * freq, y * freq, seed + i * 31.7)
        norm += amp
        amp *= gain
        freq *= 2.02
    return total / norm


def aniso_fbm(u: np.ndarray, v: np.ndarray, seed: float, stretch_x: float, octaves: int = 5) -> np.ndarray:
    """Grain runs along X — stretch X in noise domain."""
    return fbm(u * stretch_x, v * (stretch_x * 0.04), seed, octaves, 0.52)


def to_uint8(field: np.ndarray, lo: float | None = None, hi: float | None = None) -> np.ndarray:
    f = field.astype(np.float64)
    lo = lo if lo is not None else f.min()
    hi = hi if hi is not None else f.max()
    if hi - lo < 1e-8:
        return np.full(f.shape, 128, dtype=np.uint8)
    return (np.clip((f - lo) / (hi - lo), 0, 1) * 255).astype(np.uint8)


def save(path: Path, field: np.ndarray, lo: float | None = None, hi: float | None = None) -> None:
    Image.fromarray(to_uint8(field, lo, hi), mode="L").save(path)


def weathered_plank_layers(size: int, seed: float) -> dict[str, np.ndarray]:
    y = np.linspace(0, 1, size, endpoint=False)
    x = np.linspace(0, 1, size, endpoint=False)
    u, v = np.meshgrid(x, y)

    # 1 — base weathered tone (slow vertical wash, no radial lighting)
    base_tone = 0.42 + 0.10 * v + 0.04 * aniso_fbm(u * 0.8, v * 0.2, seed, 2.0, 2)

    # 2 — fine horizontal striations (hairline fibres along plank)
    fine = aniso_fbm(u, v, seed + 11, 72.0, 4) - 0.5

    # 3 — coarse horizontal bands: phase from Y only + X-warp (NO radial field)
    warp_x = (aniso_fbm(u * 2.5, v * 0.15, seed + 22, 3.0, 3) - 0.5) * 0.12
    coarse_phase = (v + warp_x) * 11 * math.pi * 2 + (aniso_fbm(u * 1.5, v * 0.25, seed + 30, 2.5, 2) - 0.5) * 0.6
    coarse = np.sin(coarse_phase)

    # 4 — sparse dark fissures: horizontal-biased defect field
    rng = np.random.default_rng(int(seed))
    defect_noise = gaussian_filter(rng.normal(size=(size, size)), sigma=8.0)
    defect_noise = gaussian_filter(defect_noise, sigma=(0.4, 6.0))  # elongate horizontally
    defect_thresh = np.percentile(defect_noise, 88)
    fissures = np.clip(defect_noise - defect_thresh, 0, None)
    fissures /= fissures.max() + 1e-8

    # 5 — micro shadow in fissure bottoms (directional, not symmetric halo)
    fissure_blur = gaussian_filter(fissures, sigma=1.5)
    fissure_shadow = gaussian_filter(fissures, sigma=3.0) - fissure_blur
    fissure_shadow = np.clip(fissure_shadow, 0, None)
    fissure_shadow /= fissure_shadow.max() + 1e-8

    # Composite: tone + bands + fine − dark fissures
    raw = base_tone + coarse * 0.10 + fine * 0.06 - fissures * 0.28 - fissure_shadow * 0.06
    composite = np.clip(raw, 0, 1)

    # WRONG approach for comparison: pseudo-radial "ring" field (what ridgeFieldAt does)
    cx, cy = 0.5, -2.8
    dx, dy = u - cx, v - cy
    radius = np.sqrt(dx ** 2 + (dy / 3.5) ** 2)
    ring_warp = (aniso_fbm(u * 2.5, v * 0.15, seed + 22, 3.0, 3) - 0.5) * 0.35
    ring_field = radius * 9 + ring_warp * 4
    ring_wrong = np.sin(ring_field * math.pi * 2) * 0.5 + 0.5

    return {
        "W1_base_tone": base_tone,
        "W2_fine_striations": fine * 0.5 + 0.5,
        "W3_coarse_bands_Y_only": coarse * 0.5 + 0.5,
        "W4_dark_fissures": fissures,
        "W5_fissure_shadow": fissure_shadow,
        "W_composite_CORRECT": composite,
        "WRONG_pseudo_radial_rings": ring_wrong,
    }


def main(out: Path) -> None:
    out.mkdir(parents=True, exist_ok=True)
    for name, field in weathered_plank_layers(SIZE, SEED).items():
        save(out / f"{name}.png", field)
    print(f"Wrote {len(list(out.glob('*.png')))} images to {out}")


if __name__ == "__main__":
    main(Path(sys.argv[1] if len(sys.argv) > 1 else "/opt/cursor/artifacts/weathered-plank-layers"))
