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
        [--crack-source hb|extracted|procedural] [--crack-count 5]
        [--debug-layers] [--suffix _tag]
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, zoom

# ---- tuned parameters (see STUDY-031 for how each was arrived at) ----
BLUR_SIGMA = 6.0            # legacy alias; crack extraction uses CRACK_BLUR_SIGMA
CRACK_BLUR_SIGMA = 6.0      # extraction blur; higher = big cracks only
SPEC_SMOOTH_SIGMA = 2.5     # stages 1 & 2: smooths the measured spectrum
FEATURE_SCALE = 9.0         # stage 3: >1 = cracks bigger & sparser (HB only)
ITERATIONS = 6              # stage 4: Heeger-Bergen alternation rounds
CRACK_STRENGTH = 0.8        # stage 7: how dark cracks cut into the grain
CRACK_FLOOR = 0.0           # post-HB: zero crack_field below this (0–1)
CRACK_KEEP_PERCENTILE = 0.0 # pre-HB: drop weak extraction pixels
PROCEDURAL_CRACK_COUNT = 4  # few major checks, like photo extract
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


def _smooth_jitter_profile(length: int, rng: np.random.Generator, sigma: float, amp: float) -> np.ndarray:
    """Low-frequency vertical wobble — organic, not per-pixel sawtooth."""
    if length <= 1:
        return np.zeros(length, dtype=np.float32)
    raw = rng.normal(0, 1, size=length).astype(np.float32)
    smooth = gaussian_filter(raw, sigma=max(1.0, min(sigma, length / 3)), mode="nearest")
    peak = float(np.max(np.abs(smooth)))
    if peak > 0:
        smooth /= peak
    return smooth * amp


def _stamp_crack_pixel(
    field: np.ndarray,
    x: int,
    y_center: float,
    thickness: float,
    strength: float,
) -> None:
    h = field.shape[0]
    t = max(1, int(round(thickness)))
    for dy in range(-t, t + 1):
        yyy = int(round(y_center)) + dy
        if 0 <= yyy < h and 0 <= x < field.shape[1]:
            core = 1.0 - abs(dy) / (t + 0.5)
            field[yyy, x] = max(field[yyy, x], core * strength)


def _draw_dashed_crack(
    field: np.ndarray,
    rng: np.random.Generator,
    y0: float,
    x0: int,
    x1: int,
    thickness: float,
    jitter_amp: float,
    jitter_sigma: float,
) -> None:
    """One major check: dashed segments, tapered ends, smooth wander."""
    length = x1 - x0
    if length <= 0:
        return
    wander = _smooth_jitter_profile(length, rng, sigma=jitter_sigma, amp=jitter_amp)
    on = np.ones(length, dtype=bool)
    i = 0
    while i < length:
        dash_len = int(rng.integers(max(10, length // 10), max(14, length // 4)))
        gap_len = int(rng.integers(2, max(5, length // 18)))
        gap_start = min(i + dash_len, length)
        gap_end = min(i + dash_len + gap_len, length)
        on[gap_start:gap_end] = False
        i += dash_len + gap_len

    for i in range(length):
        if not on[i]:
            continue
        x = x0 + i
        progress = i / max(length - 1, 1)
        envelope = float(np.sin(np.pi * progress) ** 0.65)
        local_thick = thickness * (0.8 + 0.3 * rng.random())
        _stamp_crack_pixel(field, x, y0 + wander[i], local_thick, envelope)


def procedural_crack_field(
    h: int,
    w: int,
    rng: np.random.Generator,
    count: int = PROCEDURAL_CRACK_COUNT,
    min_gap_frac: float = 0.14,
    min_span_frac: float = 0.55,
    thickness: float = 2.0,
    jitter_sigma: float = 10.0,
    jitter_amp: float = 2.5,
    micro_count: int = 0,
) -> np.ndarray:
    """Sparse horizontal crack strokes — sharp mask, tileable, photo-extract-like.

    Major checks: Poisson Y spacing, long dashed runs, smooth wander, tapered ends,
    variable thickness. Optional micro_count adds faint short dashes at low weight.
    """
    field = np.zeros((h, w), dtype=np.float32)
    min_gap = max(10, int(h * min_gap_frac))
    margin = int(max(4, thickness + 3))
    ys: list[int] = []
    attempts = 0
    while len(ys) < count and attempts < count * 50:
        attempts += 1
        y = int(rng.integers(margin, h - margin))
        if all(abs(y - yy) >= min_gap for yy in ys):
            ys.append(y)

    for y0 in ys:
        span = int(w * (min_span_frac + rng.random() * (1 - min_span_frac)))
        x0 = int(rng.integers(0, max(1, w - span)))
        x1 = min(w, x0 + span)
        crack_thick = thickness * (0.7 + rng.random() * 0.9)
        _draw_dashed_crack(
            field, rng, float(y0), x0, x1, crack_thick, jitter_amp, jitter_sigma
        )

    for _ in range(micro_count):
        y = int(rng.integers(margin, h - margin))
        span = int(w * rng.uniform(0.12, 0.35))
        x0 = int(rng.integers(0, max(1, w - span)))
        x1 = min(w, x0 + span)
        _draw_dashed_crack(field, rng, float(y), x0, x1, 1.0, jitter_amp * 0.5, jitter_sigma * 0.6)

    peak = float(field.max())
    return field / peak if peak > 0 else field


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
    debug_layers: bool = False,
    suffix: str = "",
) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    tag = f"{name}{suffix}"
    img_rgb = np.asarray(Image.open(input_path).convert("RGB"), dtype=float)
    img = np.asarray(Image.open(input_path).convert("L"), dtype=float)
    h, w = img.shape
    rng = np.random.default_rng(SEED)
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

    if crack_source == "procedural":
        crack_field = procedural_crack_field(h, w, rng, count=procedural_crack_count)
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
        choices=("hb", "extracted", "procedural"),
        default="hb",
        help="hb=Heeger-Bergen resynth; extracted=layer photo mask; procedural=draw strokes",
    )
    parser.add_argument(
        "--crack-count",
        type=int,
        default=PROCEDURAL_CRACK_COUNT,
        help="Horizontal crack strokes for --crack-source procedural",
    )
    parser.add_argument(
        "--debug-layers",
        action="store_true",
        help="Export crack_layer, crack_sparse, and crack mask debug PNGs",
    )
    parser.add_argument("--suffix", default="", help="Append to output basename (e.g. _norim)")
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
        debug_layers=args.debug_layers,
        suffix=args.suffix,
    )


if __name__ == "__main__":
    main()
