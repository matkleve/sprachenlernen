#!/usr/bin/env python3
"""Batch 2: five different crack-mask bundles × five variations (25 masks).

Families not in batch 1 — oriented filters, spectral, blur-diff layers,
ridge centerlines, grain-crease sparse, HB-on-photo-target.

Usage:
    python3 scripts/crack-bundle-variations-batch2.py [source.png] [out_dir]
"""

from __future__ import annotations

import importlib.util
import sys
import time
from dataclasses import dataclass
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy.ndimage import (
    distance_transform_edt,
    gaussian_filter,
    grey_opening,
    maximum_filter,
)

ROOT = Path(__file__).resolve().parents[1]
SYNTH_PATH = ROOT / "scripts/wood-grain-fourier-synthesis.py"
DEFAULT_SOURCE = ROOT / "design/progression/patches/wood-01.png"
DEFAULT_OUT = ROOT / "design/progression/crack-mask-tries/bundles-batch2"
ARTIFACTS = Path("/opt/cursor/artifacts")


def _load_synth():
    spec = importlib.util.spec_from_file_location("wood_synth", SYNTH_PATH)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _norm(field: np.ndarray) -> np.ndarray:
    peak = float(field.max())
    return field / (peak + 1e-8) if peak > 0 else field


def _crack_bw(field: np.ndarray) -> np.ndarray:
    peak = float(field.max())
    if peak <= 0:
        return np.full(field.shape, 255, dtype=np.uint8)
    return (255 - np.clip(field / peak * 255, 0, 255)).astype(np.uint8)


def _sparsify(field: np.ndarray, keep_p: float) -> np.ndarray:
    if keep_p <= 0:
        return field
    out = field.copy()
    pos = out[out > 0]
    if pos.size == 0:
        return out
    cut = float(np.percentile(pos, keep_p))
    out[out < cut] = 0.0
    return out


def gabor_horizontal_bank(
    h: int,
    w: int,
    rng: np.random.Generator,
    *,
    sigmas_x: tuple[float, ...],
    sigma_y: float,
    keep_p: float,
    open_frac: float,
) -> np.ndarray:
    noise = rng.normal(size=(h, w))
    field = np.zeros((h, w), dtype=np.float64)
    for sigma_x in sigmas_x:
        smooth = gaussian_filter(noise, sigma=(sigma_y, sigma_x))
        grad_y = np.gradient(smooth, axis=0)
        field += np.clip(-grad_y, 0, None) / max(sigma_x, 1.0)
    field = _sparsify(field, keep_p)
    open_w = max(8, int(w * open_frac))
    field = grey_opening(field, size=(3, open_w))
    return _norm(field)


def fft_horizontal_field(
    h: int,
    w: int,
    rng: np.random.Generator,
    win: np.ndarray,
    *,
    horiz_power: float,
    horiz_min: float,
    keep_p: float,
    mag_smooth: float,
) -> np.ndarray:
    fy = np.fft.fftfreq(h)
    fx = np.fft.fftfreq(w)
    mag = np.zeros((h, w), dtype=np.float64)
    for i in range(h):
        for j in range(w):
            horiz = abs(fx[j]) / (abs(fy[i]) + 0.02)
            if horiz > horiz_min and abs(fx[j]) > 0.008:
                mag[i, j] = horiz ** -horiz_power
    mag = gaussian_filter(mag, sigma=mag_smooth)
    mag = np.fft.ifftshift(mag)
    mag[0, 0] = 0.0
    mag /= mag.max() + 1e-8
    noise = rng.normal(size=(h, w))
    field = np.fft.ifft2(np.fft.fft2(noise * win) * mag).real
    field = np.clip(-field, 0, None)
    field = _sparsify(field, keep_p)
    return _norm(field)


def blur_diff_stack(
    synth,
    base: np.ndarray,
    h: int,
    w: int,
    rng: np.random.Generator,
    *,
    layers: tuple[tuple[float, float, float], ...],
    thin_frac: float,
) -> np.ndarray:
    """Multi-σ relu(blur−height) max stack — no grey_closing (avoids blob ponds)."""
    height = synth.synthetic_height_field(base, h, w, rng)
    span = min(h, w)
    coarse = synth._aniso_blur(height, span / 22.0, span / 14.0)
    combined = np.zeros((h, w), dtype=np.float64)
    for sigma, keep_p, weight in layers:
        layer = np.clip(
            synth._aniso_blur(coarse, sigma * 0.35, sigma) - coarse,
            0,
            None,
        )
        layer = synth._sparsify_crack_real(layer, keep_p)
        combined = np.maximum(combined, layer * weight)
    thin_w = max(6, int(w * thin_frac))
    opened = grey_opening(combined, size=(3, thin_w))
    combined = np.clip(combined - opened * 0.88, 0, None)
    return synth._normalize_crack_field(combined)


def ridge_centerlines(
    synth,
    base: np.ndarray,
    h: int,
    w: int,
    rng: np.random.Generator,
    *,
    valley_sigma: float,
    keep_p: float,
    binary_frac: float,
    ridge_size: tuple[int, int],
    smooth_sigma: float,
) -> np.ndarray:
    height = synth.synthetic_height_field(base, h, w, rng)
    span = min(h, w)
    coarse = synth._aniso_blur(height, span / 22.0, span / 14.0)
    valleys = np.clip(gaussian_filter(coarse, sigma=valley_sigma) - coarse, 0, None)
    valleys = _sparsify(valleys, keep_p)
    peak = float(valleys.max())
    if peak <= 0:
        return _norm(valleys)
    binary = (valleys > peak * binary_frac).astype(np.uint8)
    if binary.sum() == 0:
        return _norm(valleys)
    dist = distance_transform_edt(binary)
    ky, kx = ridge_size
    ridge = (maximum_filter(dist, size=(ky, kx)) == dist) & binary.astype(bool)
    field = gaussian_filter(ridge.astype(np.float64), sigma=smooth_sigma)
    return _norm(field)


def grain_crease_sparse(
    base: np.ndarray,
    *,
    pre_blur_y: float,
    pre_blur_x: float,
    keep_p: float,
    neg_weight: float,
    grad_weight: float,
) -> np.ndarray:
    """Sparse horizontal creases from synth grain — not photo, not drawn curves."""
    smooth = gaussian_filter(base, sigma=(pre_blur_y, pre_blur_x))
    grad_y = np.gradient(smooth, axis=0)
    dark = np.clip(-smooth, 0, None)
    crease = np.clip(-grad_y, 0, None)
    field = dark * neg_weight + crease * grad_weight
    field = _sparsify(field, keep_p)
    thin_w = max(6, int(base.shape[1] * 0.018))
    field = grey_opening(field, size=(3, thin_w))
    return _norm(field)


def hb_on_photo_cracks(
    synth,
    img: np.ndarray,
    h: int,
    w: int,
    rng: np.random.Generator,
    win: np.ndarray,
    *,
    blur_sigma: float,
    keep_p: float,
    feature_scale: float,
    iterations: int,
) -> np.ndarray:
    tone = gaussian_filter(img, sigma=blur_sigma)
    target = np.clip(tone - img, 0, None)
    target = synth._sparsify_crack_real(target, keep_p)
    crack_c = target - target.mean()
    spec_c = np.fft.fft2(crack_c * win)
    mag_c = gaussian_filter(np.fft.fftshift(np.abs(spec_c)), sigma=synth.SPEC_SMOOTH_SIGMA)
    mag_c = synth.scale_spectrum(mag_c, feature_scale)
    target_mag = np.fft.ifftshift(mag_c)
    target_mag[0, 0] = 0.0
    target_sorted = np.sort(target.ravel())
    cur = rng.normal(size=(h, w))
    for _ in range(iterations):
        f_cur = np.fft.fft2(cur)
        cur = np.fft.ifft2(target_mag * np.exp(1j * np.angle(f_cur))).real
        cur = synth.histogram_match(cur, target_sorted)
    return _norm(np.clip(cur, 0, None))


@dataclass(frozen=True)
class Variation:
    label: str
    params: dict


@dataclass(frozen=True)
class Bundle:
    slug: str
    title: str
    variations: tuple[Variation, ...]


def _bundles() -> tuple[Bundle, ...]:
    return (
        Bundle(
            "b2_01_gabor",
            "Gabor horizontal bank",
            (
                Variation("tight σ6,10,16 k90", {
                    "sigmas_x": (6.0, 10.0, 16.0), "sigma_y": 1.0,
                    "keep_p": 90.0, "open_frac": 0.04,
                }),
                Variation("default σ8,14,22 k91", {
                    "sigmas_x": (8.0, 14.0, 22.0), "sigma_y": 1.2,
                    "keep_p": 91.0, "open_frac": 0.05,
                }),
                Variation("wide σ10,18,28 k89", {
                    "sigmas_x": (10.0, 18.0, 28.0), "sigma_y": 1.4,
                    "keep_p": 89.0, "open_frac": 0.06,
                }),
                Variation("sparse k94", {
                    "sigmas_x": (8.0, 16.0, 24.0), "sigma_y": 1.0,
                    "keep_p": 94.0, "open_frac": 0.045,
                }),
                Variation("dense k86 open03", {
                    "sigmas_x": (6.0, 12.0, 20.0), "sigma_y": 0.9,
                    "keep_p": 86.0, "open_frac": 0.03,
                }),
            ),
        ),
        Bundle(
            "b2_02_fft_horizontal",
            "FFT horizontal spectrum",
            (
                Variation("pow1.0 h>1.5 k93", {
                    "horiz_power": 1.0, "horiz_min": 1.5, "keep_p": 93.0, "mag_smooth": 1.2,
                }),
                Variation("pow1.2 h>2 k93", {
                    "horiz_power": 1.2, "horiz_min": 2.0, "keep_p": 93.0, "mag_smooth": 1.5,
                }),
                Variation("pow0.9 h>2.5 k91", {
                    "horiz_power": 0.9, "horiz_min": 2.5, "keep_p": 91.0, "mag_smooth": 1.8,
                }),
                Variation("pow1.4 h>2 k95", {
                    "horiz_power": 1.4, "horiz_min": 2.0, "keep_p": 95.0, "mag_smooth": 1.0,
                }),
                Variation("pow1.1 h>3 k88", {
                    "horiz_power": 1.1, "horiz_min": 3.0, "keep_p": 88.0, "mag_smooth": 2.0,
                }),
            ),
        ),
        Bundle(
            "b2_03_blur_diff_stack",
            "Blur-diff layers (no close)",
            (
                Variation("micro σ8,14", {
                    "layers": ((8.0, 90.0, 0.6), (14.0, 92.0, 0.8)),
                    "thin_frac": 0.018,
                }),
                Variation("fine+major σ12,22", {
                    "layers": ((12.0, 88.0, 0.7), (22.0, 94.0, 1.0)),
                    "thin_frac": 0.022,
                }),
                Variation("triple σ10,18,28", {
                    "layers": ((10.0, 89.0, 0.5), (18.0, 92.0, 0.75), (28.0, 95.0, 1.0)),
                    "thin_frac": 0.02,
                }),
                Variation("major-only σ24 k93", {
                    "layers": ((24.0, 93.0, 1.0),),
                    "thin_frac": 0.025,
                }),
                Variation("dense micro σ6,10,14", {
                    "layers": ((6.0, 86.0, 0.55), (10.0, 88.0, 0.65), (14.0, 90.0, 0.75)),
                    "thin_frac": 0.015,
                }),
            ),
        ),
        Bundle(
            "b2_04_ridge_centerlines",
            "Valley ridge / skeleton",
            (
                Variation("σ16 k88 bin0.3", {
                    "valley_sigma": 16.0, "keep_p": 88.0, "binary_frac": 0.30,
                    "ridge_size": (3, 9), "smooth_sigma": 0.5,
                }),
                Variation("σ20 k88 bin0.35", {
                    "valley_sigma": 20.0, "keep_p": 88.0, "binary_frac": 0.35,
                    "ridge_size": (3, 9), "smooth_sigma": 0.6,
                }),
                Variation("σ24 k90 bin0.4", {
                    "valley_sigma": 24.0, "keep_p": 90.0, "binary_frac": 0.40,
                    "ridge_size": (3, 11), "smooth_sigma": 0.55,
                }),
                Variation("σ18 k92 sparse", {
                    "valley_sigma": 18.0, "keep_p": 92.0, "binary_frac": 0.38,
                    "ridge_size": (3, 7), "smooth_sigma": 0.45,
                }),
                Variation("σ22 k86 dense", {
                    "valley_sigma": 22.0, "keep_p": 86.0, "binary_frac": 0.28,
                    "ridge_size": (3, 13), "smooth_sigma": 0.7,
                }),
            ),
        ),
        Bundle(
            "b2_05_grain_crease",
            "Synth grain crease sparse",
            (
                Variation("blur1,8 k92", {
                    "pre_blur_y": 1.0, "pre_blur_x": 8.0, "keep_p": 92.0,
                    "neg_weight": 0.4, "grad_weight": 1.0,
                }),
                Variation("blur1.5,12 k90", {
                    "pre_blur_y": 1.5, "pre_blur_x": 12.0, "keep_p": 90.0,
                    "neg_weight": 0.35, "grad_weight": 1.0,
                }),
                Variation("blur0.8,6 k94 grad", {
                    "pre_blur_y": 0.8, "pre_blur_x": 6.0, "keep_p": 94.0,
                    "neg_weight": 0.2, "grad_weight": 1.2,
                }),
                Variation("blur2,16 k88 dense", {
                    "pre_blur_y": 2.0, "pre_blur_x": 16.0, "keep_p": 88.0,
                    "neg_weight": 0.5, "grad_weight": 0.9,
                }),
                Variation("blur1,10 k91 balanced", {
                    "pre_blur_y": 1.0, "pre_blur_x": 10.0, "keep_p": 91.0,
                    "neg_weight": 0.45, "grad_weight": 0.85,
                }),
            ),
        ),
    )


def _generate(
    bundle: Bundle,
    var: Variation,
    synth,
    img: np.ndarray,
    base: np.ndarray,
    h: int,
    w: int,
    win: np.ndarray,
    seed: int,
) -> np.ndarray:
    rng = np.random.default_rng(seed)
    p = var.params
    slug = bundle.slug

    if slug == "b2_01_gabor":
        return gabor_horizontal_bank(h, w, rng, **p)
    if slug == "b2_02_fft_horizontal":
        return fft_horizontal_field(h, w, rng, win, **p)
    if slug == "b2_03_blur_diff_stack":
        return blur_diff_stack(synth, base, h, w, rng, **p)
    if slug == "b2_04_ridge_centerlines":
        return ridge_centerlines(synth, base, h, w, rng, **p)
    if slug == "b2_05_grain_crease":
        return grain_crease_sparse(base, **p)
    raise ValueError(slug)


def _montage_grid(
    rows: list[list[tuple[str, Image.Image]]],
    row_titles: list[str],
    thumb: int,
    label_h: int,
    title: str,
) -> Image.Image:
    cols = len(rows[0])
    row_title_h = 22
    pad = 8
    width = pad * 2 + cols * thumb + (cols - 1) * pad
    height = pad * 2 + 28 + len(rows) * (row_title_h + thumb + label_h + pad)
    canvas = Image.new("RGB", (width, height), (22, 22, 22))
    draw = ImageDraw.Draw(canvas)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 9)
        font_b = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 12)
    except OSError:
        font = font_b = ImageFont.load_default()
    draw.text((pad, pad), title, fill=(230, 230, 230), font=font_b)
    y = pad + 28
    for row_idx, row in enumerate(rows):
        draw.text((pad, y), row_titles[row_idx], fill=(180, 200, 220), font=font_b)
        y += row_title_h
        for col_idx, (label, im) in enumerate(row):
            x = pad + col_idx * (thumb + pad)
            t = im.resize((thumb, thumb), Image.Resampling.LANCZOS)
            canvas.paste(t.convert("RGB"), (x, y))
            draw.text((x + 2, y + thumb + 2), label[:40], fill=(170, 170, 170), font=font)
        y += thumb + label_h + pad
    return canvas


def main() -> None:
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_SOURCE
    out_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUT
    out_dir.mkdir(parents=True, exist_ok=True)
    ARTIFACTS.mkdir(parents=True, exist_ok=True)

    synth = _load_synth()
    img = np.asarray(Image.open(source).convert("L"), dtype=float)
    h, w = img.shape
    rng0 = np.random.default_rng(0)
    win = np.outer(np.hanning(h), np.hanning(w))
    img_c = img - img.mean()
    spec = np.fft.fft2(img_c * win)
    mag_shifted = gaussian_filter(np.fft.fftshift(np.abs(spec)), sigma=synth.SPEC_SMOOTH_SIGMA)
    filt = np.fft.ifftshift(mag_shifted)
    filt[0, 0] = 0.0
    filt = filt / (filt.max() + 1e-8)
    base = np.fft.ifft2(np.fft.fft2(rng0.normal(size=(h, w))) * filt).real
    base = (base - base.mean()) / (base.std() + 1e-8)

    bundles = _bundles()
    grid_rows: list[list[tuple[str, Image.Image]]] = []
    row_titles: list[str] = []
    t0 = time.perf_counter()

    for bi, bundle in enumerate(bundles):
        row: list[tuple[str, Image.Image]] = []
        row_titles.append(bundle.title)
        for vi, var in enumerate(bundle.variations):
            seed = 5000 + bi * 1000 + vi * 23
            field = _generate(bundle, var, synth, img, base, h, w, win, seed)
            tag = f"{bundle.slug}_v{vi + 1}"
            bw = _crack_bw(field)
            Image.fromarray(bw, mode="L").save(out_dir / f"{tag}.png")
            row.append((var.label, Image.fromarray(bw, mode="L")))
            print(f"[{tag}] {var.label}")
        grid_rows.append(row)
        strip = _montage_grid(
            [row], [bundle.title], thumb=160, label_h=36,
            title=f"Batch2: {bundle.title}",
        )
        strip.save(out_dir / f"{bundle.slug}_strip.png")
        strip.save(ARTIFACTS / f"crack_bundle2_{bundle.slug}.png")

    mega = _montage_grid(
        grid_rows, row_titles, thumb=140, label_h=32,
        title="Batch 2 — 5 bundles × 5 variations (25 masks)",
    )
    mega.save(out_dir / "montage_5x5.png")
    mega.save(ARTIFACTS / "crack_bundles_batch2_5x5_montage.png")

    # HB bonus row — single strip appended as separate artifact
    hb_row: list[tuple[str, Image.Image]] = []
    hb_specs = [
        ("σ18 k92 scale1", {"blur_sigma": 18.0, "keep_p": 92.0, "feature_scale": 1.0, "iterations": 6}),
        ("σ18 k90 scale1", {"blur_sigma": 18.0, "keep_p": 90.0, "feature_scale": 1.0, "iterations": 6}),
        ("σ22 k92 scale1", {"blur_sigma": 22.0, "keep_p": 92.0, "feature_scale": 1.0, "iterations": 6}),
        ("σ18 k92 scale2", {"blur_sigma": 18.0, "keep_p": 92.0, "feature_scale": 2.0, "iterations": 8}),
        ("σ18 k94 scale0.5", {"blur_sigma": 18.0, "keep_p": 94.0, "feature_scale": 0.5, "iterations": 6}),
    ]
    for i, (label, params) in enumerate(hb_specs):
        rng = np.random.default_rng(9000 + i)
        field = hb_on_photo_cracks(synth, img, h, w, rng, win, **params)
        bw = _crack_bw(field)
        tag = f"b2_06_hb_photo_v{i + 1}"
        Image.fromarray(bw, mode="L").save(out_dir / f"{tag}.png")
        hb_row.append((label, Image.fromarray(bw, mode="L")))
    hb_strip = _montage_grid(
        [hb_row], ["HB on photo crack target (bonus)"], thumb=160, label_h=36,
        title="Batch2 bonus: Heeger–Bergen photo-target",
    )
    hb_strip.save(ARTIFACTS / "crack_bundle2_hb_photo_strip.png")

    elapsed = time.perf_counter() - t0
    print(f"\nDone batch2 25 + 5 HB bonus in {elapsed:.1f}s")
    print(f"Montage: {ARTIFACTS / 'crack_bundles_batch2_5x5_montage.png'}")


if __name__ == "__main__":
    main()
