#!/usr/bin/env python3
"""Generate N crack-mask tries with different methods/settings; build montage.

Target form: tapered horizontal fissures ("big cracks only"), not blobs or stripes.

Usage:
    python3 scripts/generate-crack-mask-tries.py [source.png] [out_dir]
"""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy.ndimage import (
    black_tophat,
    distance_transform_edt,
    gaussian_filter,
    generate_binary_structure,
    grey_closing,
    grey_opening,
    label as cc_label,
)

ROOT = Path(__file__).resolve().parents[1]
SYNTH_PATH = ROOT / "scripts" / "wood-grain-fourier-synthesis.py"


def _load_synth():
    spec = importlib.util.spec_from_file_location("wood_synth", SYNTH_PATH)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _crack_bw(crack: np.ndarray) -> np.ndarray:
    peak = float(crack.max())
    if peak <= 0:
        return np.full(crack.shape, 255, dtype=np.uint8)
    return (255 - np.clip(crack / peak * 255, 0, 255)).astype(np.uint8)


def dash_generator_mask(
    h: int,
    w: int,
    rng: np.random.Generator,
    n_major: int = 6,
    n_minor: int = 18,
) -> np.ndarray:
    """Tapered horizontal dash cracks — stats loosely from extracted wood-01."""
    field = np.zeros((h, w), dtype=np.float64)
    for _ in range(n_major):
        y = int(rng.integers(h * 0.08, h * 0.92))
        x0 = int(rng.integers(0, w * 0.15))
        length = int(rng.integers(w * 0.25, w * 0.75))
        thickness = rng.uniform(2.0, 5.0)
        _paint_tapered_dash(field, y, x0, length, thickness, rng, gap_prob=0.12)
    for _ in range(n_minor):
        y = int(rng.integers(0, h))
        x0 = int(rng.integers(0, w * 0.4))
        length = int(rng.integers(w * 0.08, w * 0.35))
        thickness = rng.uniform(1.0, 2.5)
        _paint_tapered_dash(field, y, x0, length, thickness, rng, gap_prob=0.35)
    return field / (field.max() + 1e-8)


def _paint_tapered_dash(
    field: np.ndarray,
    y: int,
    x0: int,
    length: int,
    thickness: float,
    rng: np.random.Generator,
    gap_prob: float,
) -> None:
    h, w = field.shape
    y += int(rng.integers(-3, 4))
    y = int(np.clip(y, 0, h - 1))
    x1 = min(w, x0 + length)
    for x in range(x0, x1):
        if rng.random() < gap_prob:
            continue
        t = (x - x0) / max(length, 1)
        taper = np.sin(np.pi * t) ** 0.7
        wobble = int(rng.integers(-1, 2))
        yy = int(np.clip(y + wobble, 0, h - 1))
        rad = max(1, int(thickness * taper * 0.5))
        for dy in range(-rad, rad + 1):
            yi = yy + dy
            if 0 <= yi < h:
                field[yi, x] = max(field[yi, x], taper)


def morph_thin_valleys(
    synth,
    base: np.ndarray,
    h: int,
    w: int,
    rng: np.random.Generator,
    keep_percentile: float,
    crack_blur_sigma: float,
    use_closing: bool,
    seed: int,
) -> np.ndarray:
    """Morphological valleys with optional closing off (less blob merge)."""
    height = synth.synthetic_height_field(base, h, w, rng)
    span = min(h, w)
    coarse = synth._aniso_blur(height, span / 22.0, span / 14.0)
    major = np.clip(
        synth._aniso_blur(coarse, crack_blur_sigma * 0.35, crack_blur_sigma) - coarse,
        0,
        None,
    )
    valleys = np.zeros_like(coarse)
    for sigma in synth.MORPH_VALLEY_SIGMAS:
        valleys += np.clip(synth._aniso_blur(coarse, sigma * 0.4, sigma) - coarse, 0, None)
    valleys /= max(len(synth.MORPH_VALLEY_SIGMAS), 1)
    bt_w = max(24, int(w * 0.14))
    morph_valleys = np.clip(black_tophat(coarse, size=(3, bt_w)), 0, None)
    combined = np.maximum(major, valleys * 0.55)
    combined = np.maximum(combined, morph_valleys * 0.7)
    if use_closing:
        close_w = max(28, int(w * synth.MORPH_CLOSE_FRAC))
        combined = grey_closing(combined, size=(3, close_w))
    open_w = max(16, int(w * synth.MORPH_OPEN_FRAC))
    combined = grey_opening(combined, size=(3, open_w))
    combined = grey_opening(combined, size=(5, 1))
    thin_w = max(10, int(w * 0.025))
    opened = grey_opening(combined, size=(3, thin_w))
    combined = np.clip(combined - opened * 0.9, 0, None)
    combined = synth._sparsify_crack_real(combined, keep_percentile)
    return synth._normalize_crack_field(combined)


def ridge_centerline_mask(
    synth,
    base: np.ndarray,
    h: int,
    w: int,
    rng: np.random.Generator,
    keep_percentile: float,
    crack_blur_sigma: float,
) -> np.ndarray:
    """Valley basins → binary → distance-transform ridge (1px centerlines)."""
    height = synth.synthetic_height_field(base, h, w, rng)
    span = min(h, w)
    coarse = synth._aniso_blur(height, span / 22.0, span / 14.0)
    valleys = np.clip(gaussian_filter(coarse, sigma=crack_blur_sigma) - coarse, 0, None)
    valleys = synth._sparsify_crack_real(valleys, keep_percentile if keep_percentile else 85)
    binary = (valleys > valleys.max() * 0.25).astype(np.uint8)
    if binary.sum() == 0:
        return valleys / (valleys.max() + 1e-8)
    dist = distance_transform_edt(binary)
    # ridge: local maxima of distance on binary support
    from scipy.ndimage import maximum_filter

    local_max = maximum_filter(dist, size=(3, 7)) == dist
    ridge = (local_max & binary.astype(bool)).astype(np.float64)
    ridge = gaussian_filter(ridge, sigma=0.8)
    return ridge / (ridge.max() + 1e-8)


def extract_majors_only(
    synth,
    img: np.ndarray,
    blur_sigma: float,
    keep_percentile: float,
    drop_fine_open: int,
) -> np.ndarray:
    """Photo extract then drop fine horizontal speckle via wide opening."""
    base_tone = gaussian_filter(img, sigma=blur_sigma)
    crack_real = np.clip(base_tone - img, 0, None)
    crack_real = synth._sparsify_crack_real(crack_real, keep_percentile)
    if drop_fine_open > 1:
        opened = grey_opening(crack_real, size=(3, drop_fine_open))
        crack_real = np.clip(crack_real - opened * 0.85, 0, None)
    return synth._normalize_crack_field(crack_real)


def build_montage(entries: list[tuple[str, Path]], out_path: Path) -> None:
    cell = entries[0][1]
    sample = Image.open(cell)
    cw, ch = sample.size
    label_h = 36
    gap = 8
    pad = 12
    cols = 5
    rows_n = 2
    width = pad * 2 + cols * cw + (cols - 1) * gap
    height = pad * 2 + rows_n * (label_h + ch) + gap
    canvas = Image.new("RGB", (width, height), (24, 24, 24))
    draw = ImageDraw.Draw(canvas)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 10)
        font_b = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 11)
    except OSError:
        font = font_b = ImageFont.load_default()
    draw.text((pad, pad), "10 crack-mask tries — target: tapered horizontal fissures", fill=(220, 220, 220), font=font_b)
    for i, (label, path) in enumerate(entries):
        col = i % cols
        row = i // cols
        x = pad + col * (cw + gap)
        y = pad + 20 + row * (label_h + ch + gap)
        draw.text((x, y), label, fill=(180, 180, 180), font=font)
        img = Image.open(path).convert("L")
        canvas.paste(img, (x, y + label_h))
    canvas.save(out_path)


def main() -> None:
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "design/progression/patches/wood-01.png"
    out_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / "design/progression/crack-mask-tries"
    art_dir = Path("/opt/cursor/artifacts")
    out_dir.mkdir(parents=True, exist_ok=True)
    art_dir.mkdir(parents=True, exist_ok=True)

    synth = _load_synth()
    img = np.asarray(Image.open(source).convert("L"), dtype=float)
    h, w = img.shape
    rng_base = np.random.default_rng(0)
    win = np.outer(np.hanning(h), np.hanning(w))

    # minimal base grain for morph methods
    img_c = img - img.mean()
    spec = np.fft.fft2(img_c * win)
    mag_shifted = gaussian_filter(np.fft.fftshift(np.abs(spec)), sigma=synth.SPEC_SMOOTH_SIGMA)
    filt = np.fft.ifftshift(mag_shifted)
    filt[0, 0] = 0.0
    filt = filt / (filt.max() + 1e-8)
    base = np.fft.ifft2(np.fft.fft2(rng_base.normal(size=(h, w))) * filt).real
    base = (base - base.mean()) / (base.std() + 1e-8)

    tries: list[tuple[str, callable]] = []

    # 10 distinct methods/settings
    configs = [
        ("01 extract blur22 keep90", lambda: extract_majors_only(synth, img, 22, 90, 0)),
        ("02 extract blur18 keep92", lambda: extract_majors_only(synth, img, 18, 92, 0)),
        ("03 extract blur18 keep92 +drop fine", lambda: extract_majors_only(synth, img, 18, 92, 24)),
        ("04 extract blur14 keep95 majors", lambda: extract_majors_only(synth, img, 14, 95, 32)),
        ("05 HB scale1 keep90 blur14", lambda: _hb_mask(synth, img, win, rng_base, 1.0, 14, 90, 0)),
        ("06 HB scale1 keep88 blur18", lambda: _hb_mask(synth, img, win, rng_base, 1.0, 18, 88, 0.25)),
        ("07 morph thin no-close p92", lambda: morph_thin_valleys(synth, base, h, w, np.random.default_rng(17), 92, 18, False, 17)),
        ("08 morph thin close p90", lambda: morph_thin_valleys(synth, base, h, w, np.random.default_rng(42), 90, 16, True, 42)),
        ("09 dash generator seed0", lambda: dash_generator_mask(h, w, np.random.default_rng(0))),
        ("10 ridge centerline p88", lambda: ridge_centerline_mask(synth, base, h, w, np.random.default_rng(99), 88, 20)),
    ]

    ref_path = out_dir / "00_reference_big_cracks.png"
    ref_field = extract_majors_only(synth, img, 18, 92, 0)
    Image.fromarray(_crack_bw(ref_field), mode="L").save(ref_path)

    entries: list[tuple[str, Path]] = []
    ref_img = Image.open(ref_path)

    print(f"{'try':<28} {'corr':>7} {'#cc':>6} {'blob':>8}")
    print("-" * 50)
    ref_bw = np.asarray(ref_img.convert("L"))

    for label, fn in configs:
        field = fn()
        path = out_dir / f"try_{label.replace(' ', '_')}.png"
        Image.fromarray(_crack_bw(field), mode="L").save(path)
        bw = np.asarray(Image.open(path).convert("L"))
        c = 1.0 - bw.astype(np.float64) / 255.0
        r = 1.0 - ref_bw.astype(np.float64) / 255.0
        corr = float(np.corrcoef(c.ravel(), r.ravel())[0, 1])
        binary = (c > 0.3).astype(np.uint8)
        _, n = cc_label(binary, structure=generate_binary_structure(2, 2))
        blob = float(binary.sum()) / max(n, 1)
        print(f"{label:<28} {corr:7.4f} {n:6d} {blob:8.0f}")
        entries.append((f"{label} corr={corr:.2f}", path))

    montage_out = art_dir / "ten_crack_mask_tries.png"
    build_montage(entries, montage_out)
    print(f"\nWrote masks to {out_dir}")
    print(f"Wrote montage {montage_out}")


def _hb_mask(synth, img, win, rng, feature_scale, blur_sigma, keep_p, floor):
    base_tone = gaussian_filter(img, sigma=blur_sigma)
    crack_real = np.clip(base_tone - img, 0, None)
    crack_for_hb = synth._sparsify_crack_real(crack_real, keep_p)
    crack_c = crack_for_hb - crack_for_hb.mean()
    spec_c = np.fft.fft2(crack_c * win)
    mag_c_shifted = gaussian_filter(np.fft.fftshift(np.abs(spec_c)), sigma=synth.SPEC_SMOOTH_SIGMA)
    mag_c_shifted = synth.scale_spectrum(mag_c_shifted, feature_scale)
    target_mag = np.fft.ifftshift(mag_c_shifted)
    target_mag[0, 0] = 0.0
    target_sorted = np.sort(crack_for_hb.ravel())
    cur = rng.normal(size=img.shape)
    for _ in range(synth.ITERATIONS):
        f_cur = np.fft.fft2(cur)
        f2 = target_mag * np.exp(1j * np.angle(f_cur))
        cur = np.fft.ifft2(f2).real
        cur = synth.histogram_match(cur, target_sorted)
    crack_field = np.clip(cur, 0, None)
    crack_field = synth._normalize_crack_field(crack_field)
    return synth._apply_crack_floor(crack_field, floor)


if __name__ == "__main__":
    main()
