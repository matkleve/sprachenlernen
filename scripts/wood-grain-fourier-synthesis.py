#!/usr/bin/env python3
"""Synthesize a wood-grain texture tile from a single reference photo via 2D
FFT spectral analysis — the primary technique for producing wood texture
source material (design/progression/, design/skill-tier-badges/-style assets).

Reasoning and evidence: docs/study/STUDY-031-photographic-wood-grain-synthesis.md
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
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, zoom

# ---- tuned parameters (see STUDY-031 for how each was arrived at) ----
BLUR_SIGMA = 6.0            # stage 2: "smooth base tone" scale
SPEC_SMOOTH_SIGMA = 2.5     # stages 1 & 2: smooths the measured spectrum
FEATURE_SCALE = 9.0         # stage 3: >1 = cracks bigger & sparser
ITERATIONS = 6               # stage 4: Heeger-Bergen alternation rounds
CRACK_STRENGTH = 0.8         # stage 7: how dark cracks cut into the grain
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


def synthesize(input_path: Path, name: str, out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
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

    # 2. isolate crack/defect residual
    base_tone = gaussian_filter(img, sigma=BLUR_SIGMA)
    crack_real = np.clip(base_tone - img, 0, None)
    crack_c = crack_real - crack_real.mean()
    spec_c = np.fft.fft2(crack_c * win)
    mag_c_shifted = gaussian_filter(np.fft.fftshift(np.abs(spec_c)), sigma=SPEC_SMOOTH_SIGMA)

    # 3. Fourier-scale the crack spectrum
    mag_c_shifted = scale_spectrum(mag_c_shifted, FEATURE_SCALE)
    target_mag = np.fft.ifftshift(mag_c_shifted)
    target_mag[0, 0] = 0.0
    target_sorted = np.sort(crack_real.ravel())

    # 4. Heeger-Bergen: spectrum + histogram matching
    cur = rng.normal(size=(h, w))
    for _ in range(ITERATIONS):
        f_cur = np.fft.fft2(cur)
        f2 = target_mag * np.exp(1j * np.angle(f_cur))
        cur = np.fft.ifft2(f2).real
        cur = histogram_match(cur, target_sorted)
    crack_field = np.clip(cur, 0, None)
    crack_field = crack_field / (crack_field.max() + 1e-8)

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
    rim_px = rim_patchy * 255 * RIM_STRENGTH
    shading = np.clip(128 + grain_px - crack_px + rim_px, 0, 255)
    Image.fromarray(shading.astype(np.uint8), mode="L").save(out_dir / f"{name}_shading.png")

    # 8. colorize: albedo x shading
    albedo = np.stack(
        [gaussian_filter(img_rgb[..., c], sigma=ALBEDO_BLUR_SIGMA) for c in range(3)], axis=-1
    )
    final = np.clip(albedo * (shading[..., None] / 128.0), 0, 255).astype(np.uint8)
    Image.fromarray(final, mode="RGB").save(out_dir / f"{name}_final.png")

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
