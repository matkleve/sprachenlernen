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

STAGES:
  1. Base grain   -- FFT the real photo -> smoothed magnitude spectrum ->
                     filter fresh white noise with it (spectral synthesis /
                     Fourier filtering method). Anisotropic: uses the real
                     2D spectrum, not a radially-averaged one, so grain
                     DIRECTION survives instead of collapsing to isotropic
                     "night sky" noise.
  2. Crack layer  -- isolate dark defects: crack = relu(blur(img) - img).
  3. Feature scale -- Fourier scaling theorem (f(kx) <-> F(u/k)/k): zoom the
                     crack spectrum about its DC center to resize crack
                     features without touching pixels. Bigger features eat
                     more of the fixed "ink" budget, so this also sparsens
                     the crack count, not just the size.
  4. Heeger-Bergen -- alternate (a) force target spectrum magnitude, keep
                     phase, (b) histogram-match to the real crack layer's
                     pixel-value distribution. A spectrum alone only
                     controls pairwise correlation; real cracks are sparse
                     and heavy-tailed (mostly none, rare strong spikes),
                     which needs the marginal distribution matched too, or
                     synthesis collapses to diffuse Gaussian haze instead of
                     distinct dark lines.
  5. Directional rim -- vertical gradient of the crack field; the "falling
                     away below the crack" sign gets the strong highlight,
                     the opposite sign a faint one. Fakes the raised/frayed
                     fiber lip real wood shows next to a split.
  6. Patchy rim   -- multiply the rim by a thresholded low-frequency noise
                     mask so the highlight doesn't run a crack's full length.
  7. Composite    -- base grain + crack darkening + rim brightening, as
                     offsets around neutral gray (128) -- a height/shading map.
  8. Colorize     -- albedo (heavily blurred real photo color) x shading
                     (stage 7, as a lighting multiplier around 128).

Usage:
    python3 scripts/wood-grain-fourier-synthesis.py <source_photo.png> <wood_name> [out_dir]
        [--rim-strength 0.6] [--no-rim] [--feature-scale 9]
        [--crack-blur-sigma 6] [--crack-floor 0] [--crack-keep-percentile 0]
        [--crack-source hb|extracted|morphological|procedural] [--crack-count 4]
        [--debug-layers] [--suffix _tag]
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import black_tophat, gaussian_filter, grey_closing, grey_opening, zoom

# ---- tuned parameters (see STUDY-031 for how each was arrived at) ----
BLUR_SIGMA = 6.0            # legacy alias; crack extraction uses CRACK_BLUR_SIGMA
CRACK_BLUR_SIGMA = 6.0      # extraction blur; higher = big cracks only
SPEC_SMOOTH_SIGMA = 2.5     # stages 1 & 2: smooths the measured spectrum
FEATURE_SCALE = 1.0         # stage 3: native crack size from photo (9.0 was bubbly blobs — 2026-08-22)
ITERATIONS = 6              # stage 4: Heeger-Bergen alternation rounds
CRACK_STRENGTH = 0.8        # stage 7: how dark cracks cut into the grain
CRACK_FLOOR = 0.0           # post-HB: zero crack_field below this (0–1)
CRACK_KEEP_PERCENTILE = 0.0 # pre-HB: drop weak extraction pixels
PROCEDURAL_CRACK_COUNT = 4  # legacy stripe mode only
MORPH_VALLEY_SIGMAS = (14.0, 22.0, 32.0)  # multi-scale; fine scales dropped to avoid speckle
MORPH_CLOSE_FRAC = 0.10  # horizontal grey_closing width as fraction of tile width
MORPH_OPEN_FRAC = 0.04   # horizontal grey_opening — keep line-like valleys, drop blobs
RIM_PRE_BLUR = 3.0           # stage 5: smooths crack field before gradient
RIM_STRENGTH = 0.6           # stage 7: brightness of the highlight
TOP_FRACTION = 0.2           # stage 5: faint highlight kept above (vs below)
PATCH_NOISE_SIGMA = 9.0      # stage 6: length scale of lit/unlit stretches
PATCH_THRESHOLD = 0.55       # stage 6: higher = more of the rim stays dark
GRAIN_CONTRAST = 14          # stage 7: base grain strength, gray levels
ALBEDO_BLUR_SIGMA = 14.0     # stage 8: how much real-photo color survives
SEED = 0


def scale_spectrum(mag_shifted: np.ndarray, feature_scale: float) -> np.ndarray:
    """Zoom a (fftshift'd) magnitude spectrum about its DC center so the
    real-space features it produces become `feature_scale` times bigger
    (>1) or smaller (<1), then pad/crop back to the original shape."""
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


def _crack_bw(crack: np.ndarray) -> np.ndarray:
    """White background, dark cracks — matches oak_crack_layer / HB debug exports."""
    peak = float(crack.max())
    if peak <= 0:
        return np.full(crack.shape, 255, dtype=np.uint8)
    return (255 - np.clip(crack / peak * 255, 0, 255)).astype(np.uint8)


def _sparsify_crack_real(crack_real: np.ndarray, keep_percentile: float) -> np.ndarray:
    """Keep only the strongest crack residuals — fewer, bigger defects for HB."""
    if keep_percentile <= 0:
        return crack_real
    out = crack_real.copy()
    positive = out[out > 0]
    if positive.size == 0:
        return out
    cut = float(np.percentile(positive, keep_percentile))
    out[out < cut] = 0.0
    return out


def _apply_crack_floor(crack_field: np.ndarray, floor: float) -> np.ndarray:
    """Drop faint crack noise before rim + composite."""
    if floor <= 0:
        return crack_field
    out = crack_field.copy()
    out[out < floor] = 0.0
    peak = float(out.max())
    if peak > 0:
        out /= peak
    return out


def _aniso_blur(arr: np.ndarray, sigma_y: float, sigma_x: float) -> np.ndarray:
    """Blur with separate vertical/horizontal sigmas — wood grain runs horizontally."""
    return gaussian_filter(arr, sigma=(max(sigma_y, 0.5), max(sigma_x, 0.5)))


def synthetic_height_field(
    base_grain: np.ndarray,
    h: int,
    w: int,
    rng: np.random.Generator,
) -> np.ndarray:
    """Slow hills/valleys only — fine grain stays in the separate grain layer, not here."""
    span = min(h, w)
    # Wider horizontal correlation → unpredictable but grain-aligned ridges/valleys
    large = _aniso_blur(rng.normal(size=(h, w)), span / 5.0, span / 2.8)
    medium = _aniso_blur(rng.normal(size=(h, w)), span / 9.0, span / 5.0)
    coarse_grain = _aniso_blur(base_grain, span / 20.0, span / 10.0) * 0.2
    height = large * 0.5 + medium * 0.35 + coarse_grain
    return (height - height.mean()) / (height.std() + 1e-8)


def morphological_crack_field(
    height: np.ndarray,
    keep_percentile: float,
    crack_blur_sigma: float,
) -> np.ndarray:
    """Extract cracks as valleys in a coarse height map (morphological + multi-scale blur).

    Pipeline: build coarse topography → multi-scale relu(blur−height) valleys →
    horizontal black-tophat grooves → connect with grey_closing → drop pepper/blob
    with horizontal grey_opening → percentile sparsify.
    """
    h, w = height.shape
    span = min(h, w)
    # Smooth vertically more than horizontally so horizontal valley channels survive
    coarse = _aniso_blur(height, span / 22.0, span / 14.0)

    # Anisotropic blur-difference: wide horizontal blur finds horizontal grooves
    major = np.clip(
        _aniso_blur(coarse, crack_blur_sigma * 0.35, crack_blur_sigma) - coarse,
        0,
        None,
    )

    valleys = np.zeros_like(coarse, dtype=np.float64)
    for sigma in MORPH_VALLEY_SIGMAS:
        valleys += np.clip(
            _aniso_blur(coarse, sigma * 0.4, sigma) - coarse,
            0,
            None,
        )
    valleys /= max(len(MORPH_VALLEY_SIGMAS), 1)

    bt_w = max(24, int(w * 0.14))
    morph_valleys = black_tophat(coarse, size=(3, bt_w))
    morph_valleys = np.clip(morph_valleys, 0, None)

    combined = np.maximum(major, valleys * 0.55)
    combined = np.maximum(combined, morph_valleys * 0.7)

    close_w = max(28, int(w * MORPH_CLOSE_FRAC))
    open_w = max(16, int(w * MORPH_OPEN_FRAC))
    combined = grey_closing(combined, size=(3, close_w))
    combined = grey_opening(combined, size=(3, open_w))
    combined = grey_opening(combined, size=(5, 1))  # drop isolated vertical pepper

    # Thin wide horizontal grooves to crack-width centerlines (white-tophat along grain)
    thin_w = max(10, int(w * 0.025))
    thick = combined
    opened = grey_opening(thick, size=(3, thin_w))
    combined = np.clip(thick - opened * 0.9, 0, None)

    combined = _sparsify_crack_real(combined, keep_percentile)
    return _normalize_crack_field(combined)


def anisotropic_multiscale_crack_field(
    h: int,
    w: int,
    rng: np.random.Generator,
    *,
    fine_sigma_y: float = 0.7,
    fine_sigma_x: float = 5.0,
    coarse_sigma_y: float = 2.5,
    coarse_sigma_x: float = 34.0,
    fine_keep_percentile: float = 84.0,
    coarse_keep_percentile: float = 97.0,
    fine_strength: float = 0.7,
    coarse_strength: float = 1.0,
) -> np.ndarray:
    """Dual-scale anisotropic noise valleys — many short stripes + few long majors.

    Fine layer: tight horizontal blur → many small dashes (lower keep = denser).
    Coarse layer: wide horizontal blur → few elongated cracks (high keep = sparse).
    """
    fine_n = gaussian_filter(rng.normal(size=(h, w)), sigma=(fine_sigma_y, fine_sigma_x))
    fine = _sparsify_crack_real(np.clip(-fine_n, 0, None), fine_keep_percentile)
    open_w = max(6, int(w * 0.018))
    fine = grey_opening(fine, size=(3, open_w))

    coarse_n = gaussian_filter(rng.normal(size=(h, w)), sigma=(coarse_sigma_y, coarse_sigma_x))
    coarse = _sparsify_crack_real(np.clip(-coarse_n, 0, None), coarse_keep_percentile)

    combined = np.maximum(fine * fine_strength, coarse * coarse_strength)
    return _normalize_crack_field(combined)


def _normalize_crack_field(crack: np.ndarray) -> np.ndarray:
    peak = float(np.max(crack))
    return crack / (peak + 1e-8) if peak > 0 else crack


def synthesize(
    input_path: Path,
    name: str,
    out_dir: Path,
    *,
    rim_strength: float = RIM_STRENGTH,
    feature_scale: float = FEATURE_SCALE,
    crack_blur_sigma: float = CRACK_BLUR_SIGMA,
    crack_floor: float = CRACK_FLOOR,
    crack_keep_percentile: float = CRACK_KEEP_PERCENTILE,
    crack_source: str = "hb",
    procedural_crack_count: int = PROCEDURAL_CRACK_COUNT,
    seed: int = SEED,
    debug_layers: bool = False,
    suffix: str = "",
) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    tag = f"{name}{suffix}"
    img_rgb = np.asarray(Image.open(input_path).convert("RGB"), dtype=float)
    img = np.asarray(Image.open(input_path).convert("L"), dtype=float)
    h, w = img.shape
    rng = np.random.default_rng(seed)
    win = np.outer(np.hanning(h), np.hanning(w))

    # 1. base grain: anisotropic spectral synthesis
    img_c = img - img.mean()
    spec = np.fft.fft2(img_c * win)
    mag_shifted = gaussian_filter(np.fft.fftshift(np.abs(spec)), sigma=SPEC_SMOOTH_SIGMA)
    filt = np.fft.ifftshift(mag_shifted)
    filt[0, 0] = 0.0
    filt = filt / (filt.max() + 1e-8)
    noise = rng.normal(size=(h, w))
    base = np.fft.ifft2(np.fft.fft2(noise) * filt).real
    base = (base - base.mean()) / (base.std() + 1e-8)

    # 2. isolate crack/defect residual (wider blur = large cracks only, not fine grain)
    base_tone = gaussian_filter(img, sigma=crack_blur_sigma)
    crack_real = np.clip(base_tone - img, 0, None)
    crack_for_hb = _sparsify_crack_real(crack_real, crack_keep_percentile)

    synthetic_height: np.ndarray | None = None

    if crack_source in ("procedural", "morphological"):
        synthetic_height = synthetic_height_field(base, h, w, rng)
        morph_keep = crack_keep_percentile if crack_keep_percentile > 0 else 85.0
        crack_field = morphological_crack_field(
            synthetic_height,
            keep_percentile=morph_keep,
            crack_blur_sigma=crack_blur_sigma,
        )
        crack_field = _apply_crack_floor(crack_field, crack_floor)
    elif crack_source == "anisotropic":
        # crack_blur_sigma scales coarse horizontal extent; keep_p drives fine density
        span = min(h, w)
        coarse_x = max(12.0, crack_blur_sigma * 2.2)
        fine_keep = crack_keep_percentile if crack_keep_percentile > 0 else 84.0
        crack_field = anisotropic_multiscale_crack_field(
            h,
            w,
            rng,
            fine_sigma_x=max(4.0, span / 100.0),
            coarse_sigma_x=coarse_x,
            fine_keep_percentile=fine_keep,
            coarse_keep_percentile=min(99.0, fine_keep + 13.0),
        )
        crack_field = _apply_crack_floor(crack_field, crack_floor)
    elif crack_source == "extracted":
        crack_field = _normalize_crack_field(crack_for_hb)
        crack_field = _apply_crack_floor(crack_field, crack_floor)
    else:
        crack_c = crack_for_hb - crack_for_hb.mean()
        spec_c = np.fft.fft2(crack_c * win)
        mag_c_shifted = gaussian_filter(np.fft.fftshift(np.abs(spec_c)), sigma=SPEC_SMOOTH_SIGMA)
        mag_c_shifted = scale_spectrum(mag_c_shifted, feature_scale)
        target_mag = np.fft.ifftshift(mag_c_shifted)
        target_mag[0, 0] = 0.0
        target_sorted = np.sort(crack_for_hb.ravel())
        cur = rng.normal(size=(h, w))
        for _ in range(ITERATIONS):
            f_cur = np.fft.fft2(cur)
            f2 = target_mag * np.exp(1j * np.angle(f_cur))
            cur = np.fft.ifft2(f2).real
            cur = histogram_match(cur, target_sorted)
        crack_field = np.clip(cur, 0, None)
        crack_field = _normalize_crack_field(crack_field)
        crack_field = _apply_crack_floor(crack_field, crack_floor)

    if debug_layers:
        Image.fromarray(_crack_bw(crack_real), mode="L").save(
            out_dir / f"{tag}_crack_layer.png"
        )
        Image.fromarray(_crack_bw(crack_for_hb), mode="L").save(
            out_dir / f"{tag}_crack_sparse.png"
        )
        if synthetic_height is not None:
            hills = np.clip(synthetic_height, -2, 2)
            hills = ((hills - hills.min()) / (hills.max() - hills.min() + 1e-8) * 255).astype(np.uint8)
            Image.fromarray(hills, mode="L").save(out_dir / f"{tag}_height_hills.png")
        Image.fromarray(_crack_bw(crack_field), mode="L").save(
            out_dir / f"{tag}_crack_{crack_source}.png"
        )

    # 5. directional rim
    smoothed = gaussian_filter(crack_field, sigma=RIM_PRE_BLUR)
    grad_y = np.gradient(smoothed, axis=0)
    rim_below = np.clip(-grad_y, 0, None)
    rim_above = np.clip(grad_y, 0, None)
    rim = rim_below + TOP_FRACTION * rim_above
    rim = rim / (rim.max() + 1e-8)

    # 6. patchy rim
    patch_noise = gaussian_filter(rng.normal(size=(h, w)), sigma=PATCH_NOISE_SIGMA)
    patch_noise = (patch_noise - patch_noise.min()) / (patch_noise.max() - patch_noise.min() + 1e-8)
    patch_mask = np.clip((patch_noise - PATCH_THRESHOLD) / (1 - PATCH_THRESHOLD), 0, 1)
    rim_patchy = rim * patch_mask

    # 7. composite (grayscale height/shading map)
    grain_px = base * GRAIN_CONTRAST
    crack_px = crack_field * 255 * CRACK_STRENGTH
    rim_px = rim_patchy * 255 * rim_strength
    shading = np.clip(128 + grain_px - crack_px + rim_px, 0, 255)
    Image.fromarray(shading.astype(np.uint8), mode="L").save(out_dir / f"{tag}_shading.png")

    # 8. colorize: albedo x shading
    albedo = np.stack(
        [gaussian_filter(img_rgb[..., c], sigma=ALBEDO_BLUR_SIGMA) for c in range(3)], axis=-1
    )
    final = np.clip(albedo * (shading[..., None] / 128.0), 0, 255).astype(np.uint8)
    Image.fromarray(final, mode="RGB").save(out_dir / f"{tag}_final.png")

    rim_note = f"rim={rim_strength}" if rim_strength else "no-rim"
    sparse_note = ""
    if crack_blur_sigma != CRACK_BLUR_SIGMA or crack_floor or crack_keep_percentile:
        sparse_note = (
            f" crack_blur={crack_blur_sigma} floor={crack_floor}"
            f" keep_p={crack_keep_percentile}"
        )
    print(
        f"[{tag}] {w}x{h} cracks={crack_source} scale={feature_scale} {rim_note}{sparse_note} -> "
        f"{tag}_shading.png, {tag}_final.png (in {out_dir})"
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="FFT wood-grain synthesis from a reference photo.")
    parser.add_argument("source", type=Path, help="Source PNG (one wood species)")
    parser.add_argument("name", help="Output basename prefix")
    parser.add_argument(
        "out_dir",
        type=Path,
        nargs="?",
        default=Path("design/progression/synthesized"),
    )
    parser.add_argument("--rim-strength", type=float, default=RIM_STRENGTH)
    parser.add_argument("--no-rim", action="store_true", help="Set rim strength to 0")
    parser.add_argument("--feature-scale", type=float, default=FEATURE_SCALE)
    parser.add_argument(
        "--crack-blur-sigma",
        type=float,
        default=CRACK_BLUR_SIGMA,
        help="Extraction blur; higher keeps only larger cracks (default 6)",
    )
    parser.add_argument(
        "--crack-floor",
        type=float,
        default=CRACK_FLOOR,
        help="Zero synthesized crack field below this 0–1 level before rim",
    )
    parser.add_argument(
        "--crack-keep-percentile",
        type=float,
        default=CRACK_KEEP_PERCENTILE,
        help="Drop crack_real below this percentile among positive pixels (e.g. 85)",
    )
    parser.add_argument(
        "--crack-source",
        choices=("hb", "extracted", "morphological", "procedural", "anisotropic"),
        default="hb",
        help="hb=Heeger-Bergen; extracted=photo; morphological=valleys; anisotropic=dual-scale noise stripes",
    )
    parser.add_argument(
        "--crack-count",
        type=int,
        default=PROCEDURAL_CRACK_COUNT,
        help="Unused (legacy); morphological mode ignores stripe count",
    )
    parser.add_argument(
        "--debug-layers",
        action="store_true",
        help="Export crack_layer, crack_sparse, and crack mask debug PNGs",
    )
    parser.add_argument("--suffix", default="", help="Append to output basename (e.g. _norim)")
    parser.add_argument("--seed", type=int, default=SEED, help="RNG seed for grain + synthetic hills")
    args = parser.parse_args()
    rim_strength = 0.0 if args.no_rim else args.rim_strength
    synthesize(
        args.source,
        args.name,
        args.out_dir,
        rim_strength=rim_strength,
        feature_scale=args.feature_scale,
        crack_blur_sigma=args.crack_blur_sigma,
        crack_floor=args.crack_floor,
        crack_keep_percentile=args.crack_keep_percentile,
        crack_source=args.crack_source,
        procedural_crack_count=args.crack_count,
        seed=args.seed,
        debug_layers=args.debug_layers,
        suffix=args.suffix,
    )


if __name__ == "__main__":
    main()
