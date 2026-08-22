#!/usr/bin/env python3
"""Generate greyscale layer decompositions for wood-like procedural textures.

Algorithms demonstrated:
  A. Multi-scale horizontal fibre stack (STUDY-030 / wood-grain-ridges model)
  B. Domain-warped contour field (procedural-wood.ts model)
  C. Stratified terrain + hydraulic channel carving (landscape erosion metaphor)
  D. FFT spectral grain layer (STUDY-032 simplified)

Output: PNG tiles in out_dir — each layer + composite.
"""

from __future__ import annotations

import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, zoom


SIZE = 512
SEED = 42


def hash2(x: np.ndarray, y: np.ndarray, seed: float) -> np.ndarray:
    return (np.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123) % 1.0


def smoothstep(t: np.ndarray) -> np.ndarray:
    return t * t * (3 - 2 * t)


def value_noise(x: np.ndarray, y: np.ndarray, seed: float) -> np.ndarray:
    x0 = np.floor(x)
    y0 = np.floor(y)
    tx = smoothstep(x - x0)
    ty = smoothstep(y - y0)
    a = hash2(x0, y0, seed)
    b = hash2(x0 + 1, y0, seed)
    c = hash2(x0, y0 + 1, seed)
    d = hash2(x0 + 1, y0 + 1, seed)
    ab = a + (b - a) * tx
    cd = c + (d - c) * tx
    return ab + (cd - ab) * ty


def fbm(x: np.ndarray, y: np.ndarray, seed: float, octaves: int = 5, gain: float = 0.5) -> np.ndarray:
    amp = 0.5
    freq = 1.0
    total = np.zeros_like(x)
    norm = 0.0
    for i in range(octaves):
        total += amp * value_noise(x * freq, y * freq, seed + i * 31.7)
        norm += amp
        amp *= gain
        freq *= 2.02
    return total / norm


def to_uint8(field: np.ndarray, lo: float | None = None, hi: float | None = None) -> np.ndarray:
    f = field.astype(np.float64)
    if lo is None:
        lo = f.min()
    if hi is None:
        hi = f.max()
    if hi - lo < 1e-8:
        return np.full(f.shape, 128, dtype=np.uint8)
    t = np.clip((f - lo) / (hi - lo), 0, 1)
    return (t * 255).astype(np.uint8)


def save_gray(path: Path, field: np.ndarray, lo: float | None = None, hi: float | None = None) -> None:
    Image.fromarray(to_uint8(field, lo, hi), mode="L").save(path)


def make_coords(size: int) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    y = np.linspace(0, 1, size, endpoint=False)
    x = np.linspace(0, 1, size, endpoint=False)
    u, v = np.meshgrid(x, y)
    return u, v, x, y


def model_a_horizontal_layers(size: int, seed: float) -> dict[str, np.ndarray]:
    """STUDY-030: stacked horizontal scales — base wash, coarse, fine, warp, speckle."""
    u, v, _, _ = make_coords(size)
    # Layer 1: base colour wash (slow vertical gradient + mild radial bench light)
    base_wash = 0.55 + 0.12 * v + 0.08 * (1 - np.sqrt((u - 0.5) ** 2 + (v - 0.35) ** 2))

    # Layer 2: coarse horizontal streaks — low-frequency bands along grain (X)
    coarse_phase = v * 14 * math.pi * 2 + fbm(u * 1.2, v * 0.3, seed, 3) * 1.2
    coarse = np.sin(coarse_phase)

    # Layer 3: fine fibres — high-frequency anisotropic fBm (stretch X)
    fine = fbm(u * 48, v * 2.8, seed + 17, 5, 0.55) - 0.5

    # Layer 4: warp field magnitude (domain displacement energy)
    warp_x = (fbm(u * 3.2, v * 0.9, seed + 33, 4) - 0.5) * 0.35
    warp_y = (fbm(u * 3.2 + 2.1, v * 0.9 + 1.3, seed + 47, 4) - 0.5) * 0.18
    warp_mag = np.sqrt(warp_x ** 2 + warp_y ** 2)

    # Layer 5: speckle (hairline micro-variation)
    speckle = value_noise(u * size * 0.9, v * size * 0.9, seed + 41) - 0.5

    # Composite: weighted stack → tanh contrast shaping
    raw = (
        base_wash
        + coarse * 0.22
        + fine * 0.14
        + warp_mag * 0.08
        + speckle * 0.04
    )
    composite = np.tanh((raw - 0.55) * 3.2) * 0.5 + 0.5

    return {
        "A1_base_wash": base_wash,
        "A2_coarse_streaks": coarse * 0.5 + 0.5,
        "A3_fine_fibres": fine * 0.5 + 0.5,
        "A4_warp_field": warp_mag,
        "A5_speckle": speckle * 0.5 + 0.5,
        "A_composite": composite,
    }


def model_b_domain_warp_contours(size: int, seed: float) -> dict[str, np.ndarray]:
    """procedural-wood.ts: pseudo-radial contour field + domain warp + ring/fibre mix."""
    u, v, _, _ = make_coords(size)
    stretch = 8.0
    px = u * stretch
    py = v

    warp_freq = 2.8
    warp_strength = 0.38
    warp_x = (fbm(px * warp_freq, py * warp_freq, seed, 3) - 0.5) * warp_strength
    warp_y = (fbm(px * warp_freq + 4.1, py * warp_freq + 1.7, seed + 4, 3) - 0.5) * warp_strength
    wx = px + warp_x
    wy = py + warp_y

    ring_phase = wy * 9 * math.pi * 2 + fbm(wx * 0.8, wy * 0.25, seed + 8, 2) * 1.4
    rings = np.sin(ring_phase)
    fibres = fbm(wx * 42, wy * 2.5, seed + 12, 5, 0.55)

    grain_mix = 0.35
    blended = rings * (1 - grain_mix) + fibres * grain_mix
    composite = np.tanh(blended * 0.88 * 2.4) * 0.5 + 0.5

    return {
        "B1_warp_x": warp_x * 0.5 + 0.5,
        "B2_warp_y": warp_y * 0.5 + 0.5,
        "B3_ring_waves": rings * 0.5 + 0.5,
        "B4_fibre_noise": fibres,
        "B5_blended_field": blended * 0.5 + 0.5,
        "B_composite": composite,
    }


def model_c_stratified_erosion(size: int, seed: float) -> dict[str, np.ndarray]:
    """Landscape metaphor: fBm terrain → ridge sharpen → flow channels carve strata."""
    u, v, _, _ = make_coords(size)

    # Layer 1: base terrain (multiscale height field)
    terrain = fbm(u * 3.5, v * 3.5, seed, 6, 0.52)

    # Layer 2: ridged multifractal — mountain ridges (1 - |noise|)
    ridged = 1.0 - abs(fbm(u * 5.2, v * 5.2, seed + 20, 5) - 0.5) * 2

    # Layer 3: stratified horizontal layers (sediment beds) before erosion
    strata_phase = v * 28 * math.pi * 2 + fbm(u * 2.0, v * 0.4, seed + 30, 3) * 0.8
    strata = np.sin(strata_phase) * 0.5 + 0.5

    # Layer 4: flow accumulation proxy — integrate downhill gradient magnitude
    gy, gx = np.gradient(terrain)
    slope = np.sqrt(gx ** 2 + gy ** 2)
    flow = gaussian_filter(slope, sigma=2.5)
    # water carves where slope is high + low terrain
    carve_mask = np.clip((flow - flow.mean()) * 6 + (terrain.mean() - terrain) * 2.5, 0, 1)
    carve_mask = gaussian_filter(carve_mask, sigma=1.2)

    # Layer 5: eroded strata — beds warped by terrain, cut by channels
    warped_strata = np.sin(
        (v + terrain * 0.22 - carve_mask * 0.35) * 28 * math.pi * 2
        + fbm(u * 2.0, v * 0.4, seed + 30, 3) * 0.8
    )
    eroded_strata = warped_strata * (1 - carve_mask * 0.85) * 0.5 + 0.5

    composite = (
        0.35 * terrain
        + 0.20 * ridged
        + 0.30 * eroded_strata
        + 0.15 * (1 - carve_mask)
    )
    composite = np.clip(composite, 0, 1)

    return {
        "C1_terrain_fbm": terrain,
        "C2_ridged_ridges": ridged,
        "C3_horizontal_strata": strata,
        "C4_flow_carve_mask": carve_mask,
        "C5_eroded_strata": eroded_strata,
        "C_composite": composite,
    }


def model_d_fft_grain(size: int, seed: float) -> dict[str, np.ndarray]:
    """STUDY-032 simplified: synthetic anisotropic spectrum → filtered noise grain."""
    rng = np.random.default_rng(int(seed))
    h, w = size, size
    win = np.outer(np.hanning(h), np.hanning(w))

    # Build a fake "measured" anisotropic spectrum from horizontal sine beds + noise
    u, v, _, _ = make_coords(size)
    ref = np.sin(v * 22 * math.pi * 2) * 0.4 + fbm(u * 6, v * 1.2, seed, 4) * 0.3
    ref_c = ref - ref.mean()
    spec = np.fft.fft2(ref_c * win)
    mag = gaussian_filter(np.fft.fftshift(np.abs(spec)), sigma=2.0)
    filt = np.fft.ifftshift(mag)
    filt[0, 0] = 0
    filt /= filt.max() + 1e-8

    noise = rng.normal(size=(h, w))
    noise_c = noise - noise.mean()
    noise_spec = np.fft.fft2(noise_c * win)
    synth = np.fft.ifft2(noise_spec * filt).real
    grain = synth / (np.abs(synth).max() + 1e-8)

    # Crack layer: relu(smooth - raw) sparse defects
    smooth = gaussian_filter(grain, sigma=6)
    crack = np.clip(smooth - grain, 0, None)
    crack /= crack.max() + 1e-8

    # Heeger-Bergen one iteration: spectrum + histogram match to crack sorted values
    crack_sorted = np.sort(crack.ravel())
    ranks = np.argsort(np.argsort(rng.normal(size=crack.shape).ravel()))
    crack_matched = crack_sorted[ranks].reshape(crack.shape)

    composite = grain * 0.55 + 0.45 - crack_matched * 0.35
    composite = np.clip(composite * 0.5 + 0.5, 0, 1)

    return {
        "D1_white_noise": noise / (np.abs(noise).max() + 1e-8) * 0.5 + 0.5,
        "D2_aniso_spectrum": mag / (mag.max() + 1e-8),
        "D3_spectral_grain": grain * 0.5 + 0.5,
        "D4_crack_defects": crack_matched,
        "D_composite": composite,
    }


def main(out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    models = [
        ("model_a_horizontal", model_a_horizontal_layers),
        ("model_b_domain_warp", model_b_domain_warp_contours),
        ("model_c_stratified_erosion", model_c_stratified_erosion),
        ("model_d_fft_grain", model_d_fft_grain),
    ]
    for prefix, fn in models:
        layers = fn(SIZE, SEED)
        for name, field in layers.items():
            save_gray(out_dir / f"{prefix}_{name}.png", field)

    # Master combination: blend best wood stack + eroded strata read
    a = model_a_horizontal_layers(SIZE, SEED)["A_composite"]
    c = model_c_stratified_erosion(SIZE, SEED)["C_composite"]
    hybrid = np.clip(0.62 * a + 0.38 * c, 0, 1)
    save_gray(out_dir / "hybrid_wood_plus_eroded_strata.png", hybrid)
    print(f"Wrote {len(list(out_dir.glob('*.png')))} images to {out_dir}")


if __name__ == "__main__":
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "/opt/cursor/artifacts/wood-landscape-layers")
    main(out)
