#!/usr/bin/env python3
"""Synthesize a wood-grain texture tile from a single reference photo via 2D
FFT spectral analysis — the primary technique for producing wood texture
source material (design/progression/, design/skill-tier-badges/-style assets).

Reasoning and evidence: docs/study/STUDY-032-photographic-wood-grain-synthesis.md
Does NOT replace the live-redrawing procedural canvas at /dev/wood-textures
(lib/wood-grain-ridges.ts) — that stays the resize-safe renderer per
docs/specs/page/wood-texture-lab.md. This script produces baked reference
tiles: source material an artist/agent can crop into design/progression/ or
use as a CSS background-image ("tile" is an explicitly permitted
implementation choice in docs/specs/feature/progression-reference-board.md).

Source photo requirements: ONE wood species per image (no grid — a grid
splits resolution N ways and creates hard seams that contaminate the FFT),
maximum resolution, flat/uniform lighting, zero perspective, PNG not JPEG.

Height-field model (STUDY-032): luminance is relief — light = ridge, dark =
valley. Cracks are directional grooves cut into that surface, not soft blur
blobs. Valley depth = local ridge envelope minus height; horizontal grooves
use a vertical morphological ridge envelope (max along columns).

STAGES:
  1. Base grain   -- FFT the real photo -> smoothed magnitude spectrum ->
                     filter fresh white noise with it (spectral synthesis).
  2. Valley layers -- fine + coarse depth from vertical ridge envelope;
                     coarse = deep envelope minus fine (big fissures only).
  3. Feature scale -- optional spectrum zoom per layer (native = 1.0).
  4. Heeger-Bergen -- match spectrum + elongated depth histogram per layer.
  5. Shape grooves -- horizontal max-pool on continuous depth (flat floors,
                     grain direction; never binarize to black rectangles).
  6. Directional rim -- vertical gradient of combined valley depth.
  7. Patchy rim   -- thresholded low-frequency mask on the rim.
  8. Composite    -- height map: neutral + grain ripple - valley cuts + rim.
  9. Colorize     -- albedo x shading / 128.

Usage:
    python3 scripts/wood-grain-fourier-synthesis.py <source_photo.png> <wood_name> [out_dir]
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, grey_dilation, maximum_filter, zoom

# ---- tuned parameters (see STUDY-032) ----
FINE_VALLEY_RADIUS = 7         # vertical ridge envelope for fine checking (px)
COARSE_VALLEY_RADIUS = 41      # vertical envelope for wide fissures (px)
SPEC_SMOOTH_SIGMA = 2.5        # smooth measured spectra before synthesis
FEATURE_SCALE = 1.0            # native scale (9.0 was bubbly blobs — 2026-08-22)
COARSE_FEATURE_SCALE = 1.0
ITERATIONS = 6                 # Heeger-Bergen rounds per valley layer
FINE_VALLEY_STRENGTH = 0.52    # depth cut — keep wood visible between grooves
COARSE_VALLEY_STRENGTH = 0.68
FINE_VALLEY_FLOOR = 0.12
FINE_VALLEY_POWER = 1.45
COARSE_VALLEY_FLOOR = 0.08
COARSE_VALLEY_POWER = 1.35
FINE_RUN_W = 22                # horizontal max-pool along grain (px)
FINE_BAND_H = 2                # groove height (px)
COARSE_RUN_W = 48
COARSE_BAND_H = 5
GROOVE_ACTIVE = 0.10           # min normalized depth before elongation applies
RIM_PRE_BLUR = 2.0             # rim only — valleys stay sharp
RIM_STRENGTH = 0.6
TOP_FRACTION = 0.2
PATCH_NOISE_SIGMA = 9.0
PATCH_THRESHOLD = 0.55
GRAIN_CONTRAST = 14
ALBEDO_BLUR_SIGMA = 14.0
SEED = 0


def scale_spectrum(mag_shifted: np.ndarray, feature_scale: float) -> np.ndarray:
    """Zoom a (fftshift'd) magnitude spectrum about its DC center."""
    h, w = mag_shifted.shape
    k = 1.0 / feature_scale
    zoomed = zoom(mag_shifted, zoom=k, order=1)
    zh, zw = zoomed.shape
    out = np.zeros((h, w), dtype=zoomed.dtype)
    if k >= 1:
        cy, cx = zh // 2, zw // 2
        y0, x0 = cy - h // 2, cx - w // 2
        out = zoomed[y0 : y0 + h, x0 : x0 + w]
    else:
        cy, cx = h // 2, w // 2
        y0, x0 = cy - zh // 2, cx - zw // 2
        out[y0 : y0 + zh, x0 : x0 + zw] = zoomed
    return out


def histogram_match(source: np.ndarray, target_sorted_vals: np.ndarray) -> np.ndarray:
    flat = source.ravel()
    ranks = np.argsort(np.argsort(flat))
    return target_sorted_vals[ranks].reshape(source.shape)


def vertical_ridge_envelope(height: np.ndarray, radius: int) -> np.ndarray:
    """Local ridge height for horizontal grain: max along columns in a vertical window."""
    foot = np.ones((max(3, int(radius) | 1), 1))
    return grey_dilation(height, footprint=foot)


def valley_depth(height: np.ndarray, radius: int) -> np.ndarray:
    """Depth below the local ridge surface — sharp directional valley, not blur."""
    return np.clip(vertical_ridge_envelope(height, radius) - height, 0, None)


def extract_valley_layers(height: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Fine checking grooves + coarse fissures (band-pass in valley depth)."""
    fine = valley_depth(height, FINE_VALLEY_RADIUS)
    deep = valley_depth(height, COARSE_VALLEY_RADIUS)
    coarse = np.clip(deep - fine, 0, None)
    return fine, coarse


def sharpen_valleys(field: np.ndarray, floor: float, power: float) -> np.ndarray:
    """Steepen valley walls — HB output is still too soft without this."""
    peak = field.max()
    if peak <= 0:
        return field
    norm = field / peak
    scaled = np.clip((norm - floor) / (1.0 - floor + 1e-8), 0, 1)
    return scaled**power


def elongate_grooves(depth: np.ndarray, run_w: int, band_h: int) -> np.ndarray:
    """Continuous horizontal max-pool — flat groove floors, grain direction.

    Binarizing grooves (canalize) punched black rectangles through the tile.
    This stays in [0, 1] depth space: max along horizontal windows bridges HB
    stipple into elongated plateaus without voiding the whole surface.
    """
    peak = depth.max()
    if peak <= 0:
        return depth
    norm = depth / peak
    run_w = max(3, int(run_w) | 1)
    band_h = max(1, int(band_h))
    pooled = maximum_filter(norm, size=(band_h, run_w), mode="nearest")
    active = norm >= GROOVE_ACTIVE
    out = np.where(active, pooled, 0.0)
    peak2 = out.max()
    return out / peak2 if peak2 > 0 else out


def shape_grooves(
    field: np.ndarray,
    floor: float,
    power: float,
    run_w: int,
    band_h: int,
) -> np.ndarray:
    """Sharpen then elongate — continuous depth, not a boolean mask."""
    sharpened = sharpen_valleys(field, floor, power)
    return elongate_grooves(sharpened, run_w, band_h)


def synthesize_valley_field(
    valley_real: np.ndarray,
    win: np.ndarray,
    feature_scale: float,
    rng: np.random.Generator,
    run_w: int,
    band_h: int,
) -> np.ndarray:
    """Heeger–Bergen placement + sparsity from measured, elongated valley depth."""
    h, w = valley_real.shape
    valley_model = elongate_grooves(valley_real, run_w, band_h)
    valley_c = valley_model - valley_model.mean()
    spec_c = np.fft.fft2(valley_c * win)
    mag_c_shifted = gaussian_filter(np.fft.fftshift(np.abs(spec_c)), sigma=SPEC_SMOOTH_SIGMA)
    mag_c_shifted = scale_spectrum(mag_c_shifted, feature_scale)
    target_mag = np.fft.ifftshift(mag_c_shifted)
    target_mag[0, 0] = 0.0
    target_sorted = np.sort(valley_model.ravel())

    cur = rng.normal(size=(h, w))
    for _ in range(ITERATIONS):
        f_cur = np.fft.fft2(cur)
        f2 = target_mag * np.exp(1j * np.angle(f_cur))
        cur = np.fft.ifft2(f2).real
        cur = histogram_match(cur, target_sorted)
    field = np.clip(cur, 0, None)
    peak = field.max()
    if peak > 0:
        field = field / peak
    return field


def build_layers(input_path: Path) -> dict[str, np.ndarray]:
    """All intermediate layers for diagnostics (grayscale fields in ~0–1 or 0–255)."""
    img_rgb = np.asarray(Image.open(input_path).convert("RGB"), dtype=float)
    height = np.asarray(Image.open(input_path).convert("L"), dtype=float)
    h, w = height.shape
    rng_fine = np.random.default_rng(SEED)
    rng_coarse = np.random.default_rng(SEED + 1)
    win = np.outer(np.hanning(h), np.hanning(w))

    height_c = height - height.mean()
    spec = np.fft.fft2(height_c * win)
    mag_shifted = gaussian_filter(np.fft.fftshift(np.abs(spec)), sigma=SPEC_SMOOTH_SIGMA)
    filt = np.fft.ifftshift(mag_shifted)
    filt[0, 0] = 0.0
    filt = filt / (filt.max() + 1e-8)
    noise = rng_fine.normal(size=(h, w))
    base = np.fft.ifft2(np.fft.fft2(noise) * filt).real
    base = (base - base.mean()) / (base.std() + 1e-8)

    valley_fine_real, valley_coarse_real = extract_valley_layers(height)
    fine_hb_raw = synthesize_valley_field(
        valley_fine_real, win, FEATURE_SCALE, rng_fine, FINE_RUN_W, FINE_BAND_H
    )
    coarse_hb_raw = synthesize_valley_field(
        valley_coarse_real, win, COARSE_FEATURE_SCALE, rng_coarse, COARSE_RUN_W, COARSE_BAND_H
    )
    valley_fine = shape_grooves(
        fine_hb_raw, FINE_VALLEY_FLOOR, FINE_VALLEY_POWER, FINE_RUN_W, FINE_BAND_H
    )
    valley_coarse = shape_grooves(
        coarse_hb_raw, COARSE_VALLEY_FLOOR, COARSE_VALLEY_POWER, COARSE_RUN_W, COARSE_BAND_H
    )
    valley_combined = np.clip(valley_fine + valley_coarse, 0, 1)

    smoothed = gaussian_filter(valley_combined, sigma=RIM_PRE_BLUR)
    grad_y = np.gradient(smoothed, axis=0)
    rim_below = np.clip(-grad_y, 0, None)
    rim_above = np.clip(grad_y, 0, None)
    rim = rim_below + TOP_FRACTION * rim_above
    rim = rim / (rim.max() + 1e-8)

    patch_noise = gaussian_filter(rng_fine.normal(size=(h, w)), sigma=PATCH_NOISE_SIGMA)
    patch_noise = (patch_noise - patch_noise.min()) / (patch_noise.max() - patch_noise.min() + 1e-8)
    patch_mask = np.clip((patch_noise - PATCH_THRESHOLD) / (1 - PATCH_THRESHOLD), 0, 1)
    rim_patchy = rim * patch_mask

    grain_px = base * GRAIN_CONTRAST
    valley_px = (
        valley_fine * 255 * FINE_VALLEY_STRENGTH
        + valley_coarse * 255 * COARSE_VALLEY_STRENGTH
    )
    rim_px = rim_patchy * 255 * RIM_STRENGTH
    shading = np.clip(128 + grain_px - valley_px + rim_px, 0, 255)

    albedo = np.stack(
        [gaussian_filter(img_rgb[..., c], sigma=ALBEDO_BLUR_SIGMA) for c in range(3)], axis=-1
    )
    final = np.clip(albedo * (shading[..., None] / 128.0), 0, 255)

    def norm01(a: np.ndarray) -> np.ndarray:
        p = a.max()
        return (a / p) if p > 0 else a

    return {
        "height": norm01(height),
        "measured_fine_valley": norm01(valley_fine_real),
        "measured_coarse_valley": norm01(valley_coarse_real),
        "measured_fine_valley_raw": valley_fine_real,
        "measured_coarse_valley_raw": valley_coarse_real,
        "base_grain": norm01(base),
        "hb_fine_raw": fine_hb_raw,
        "hb_coarse_raw": coarse_hb_raw,
        "fine_shaped": valley_fine,
        "coarse_shaped": valley_coarse,
        "valley_combined": valley_combined,
        "rim": rim,
        "rim_patchy": rim_patchy,
        "shading": shading,
        "final_rgb": final,
        "albedo": albedo,
        "img_rgb": img_rgb,
        "grain_px": grain_px,
    }


def synthesize(input_path: Path, name: str, out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    layers = build_layers(input_path)
    shading = layers["shading"]
    final = layers["final_rgb"]
    Image.fromarray(shading.astype(np.uint8), mode="L").save(out_dir / f"{name}_shading.png")
    Image.fromarray(final.astype(np.uint8), mode="RGB").save(out_dir / f"{name}_final.png")
    h, w = shading.shape
    print(f"[{name}] {w}x{h} -> {name}_shading.png, {name}_final.png (in {out_dir})")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    synthesize(
        Path(sys.argv[1]),
        sys.argv[2],
        Path(sys.argv[3]) if len(sys.argv) > 3 else Path("design/progression/synthesized"),
    )
