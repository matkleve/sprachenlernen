#!/usr/bin/env python3
"""Generate 10 *generative* crack-mask algorithms (no photo extraction in tries).

Scores each against a reference target mask (extracted big-cracks-only) for QA only.

Usage:
    python3 scripts/generate-crack-mask-tries.py [source.png] [out_dir]

    source.png — used only to size the tile and build FFT grain context for some
    algorithms; crack masks are not photo-extracted in the 10 tries.
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
    maximum_filter,
    label as cc_label,
)

ROOT = Path(__file__).resolve().parents[1]
SYNTH_PATH = ROOT / "scripts/design/wood-grain-fourier-synthesis.py"


def _load_synth():
    spec = importlib.util.spec_from_file_location("wood_synth", SYNTH_PATH)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _norm(field: np.ndarray) -> np.ndarray:
    peak = float(field.max())
    return field / (peak + 1e-8) if peak > 0 else field


def _crack_bw(crack: np.ndarray) -> np.ndarray:
    peak = float(crack.max())
    if peak <= 0:
        return np.full(crack.shape, 255, dtype=np.uint8)
    return (255 - np.clip(crack / peak * 255, 0, 255)).astype(np.uint8)


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
    y = int(np.clip(y + rng.integers(-2, 3), 0, h - 1))
    x1 = min(w, x0 + length)
    for x in range(max(0, x0), x1):
        if rng.random() < gap_prob:
            continue
        t = (x - x0) / max(length, 1)
        taper = float(np.sin(np.pi * t) ** 0.65)
        yy = int(np.clip(y + rng.integers(-1, 2), 0, h - 1))
        rad = max(1, int(thickness * taper * 0.5))
        for dy in range(-rad, rad + 1):
            yi = yy + dy
            if 0 <= yi < h:
                field[yi, x] = max(field[yi, x], taper)


# ---- 10 generative algorithms -----------------------------------------------

def algo01_heeger_bergen(
    synth, h: int, w: int, rng: np.random.Generator, win: np.ndarray
) -> np.ndarray:
    """HB on synthetic sparse anisotropic noise target — no photo crack layer."""
    sparse = rng.normal(size=(h, w))
    sparse = gaussian_filter(sparse, sigma=(2.0, 18.0))
    sparse = _sparsify(np.clip(sparse, 0, None), 92)
    crack_c = sparse - sparse.mean()
    spec_c = np.fft.fft2(crack_c * win)
    mag = gaussian_filter(np.fft.fftshift(np.abs(spec_c)), sigma=synth.SPEC_SMOOTH_SIGMA)
    target_mag = np.fft.ifftshift(mag)
    target_mag[0, 0] = 0.0
    target_sorted = np.sort(sparse.ravel())
    cur = rng.normal(size=(h, w))
    for _ in range(synth.ITERATIONS):
        f_cur = np.fft.fft2(cur)
        cur = np.fft.ifft2(target_mag * np.exp(1j * np.angle(f_cur))).real
        cur = synth.histogram_match(cur, target_sorted)
    return _norm(np.clip(cur, 0, None))


def algo02_morphological_valleys(
    synth, base: np.ndarray, h: int, w: int, rng: np.random.Generator
) -> np.ndarray:
    """Synthetic height → morphological valley extract (no photo)."""
    return synth.morphological_crack_field(
        synth.synthetic_height_field(base, h, w, rng),
        keep_percentile=90.0,
        crack_blur_sigma=18.0,
    )


def algo03_tapered_dash_scatter(h: int, w: int, rng: np.random.Generator) -> np.ndarray:
    """Random tapered horizontal dashes with gap breaks."""
    field = np.zeros((h, w), dtype=np.float64)
    for _ in range(rng.integers(5, 9)):
        y = int(rng.integers(h * 0.1, h * 0.9))
        x0 = int(rng.integers(0, int(w * 0.2)))
        length = int(rng.integers(int(w * 0.3), int(w * 0.8)))
        _paint_tapered_dash(field, y, x0, length, rng.uniform(2.5, 5.0), rng, 0.15)
    for _ in range(rng.integers(12, 28)):
        y = int(rng.integers(0, h))
        x0 = int(rng.integers(0, int(w * 0.5)))
        length = int(rng.integers(int(w * 0.06), int(w * 0.3)))
        _paint_tapered_dash(field, y, x0, length, rng.uniform(1.0, 2.5), rng, 0.4)
    return _norm(field)


def algo04_poisson_horizontal_runs(h: int, w: int, rng: np.random.Generator) -> np.ndarray:
    """Poisson Y positions; each run is a tapered intensity profile along X."""
    field = np.zeros((h, w), dtype=np.float64)
    n_lines = int(rng.integers(40, 90))
    ys = rng.integers(0, h, size=n_lines)
    for y in ys:
        x0 = int(rng.integers(0, int(w * 0.6)))
        run_len = int(rng.integers(int(w * 0.05), int(w * 0.45)))
        thick = rng.uniform(0.8, 3.0)
        gap = rng.uniform(0.1, 0.35)
        _paint_tapered_dash(field, int(y), x0, run_len, thick, rng, gap)
    return _norm(field)


def algo05_anisotropic_noise_threshold(h: int, w: int, rng: np.random.Generator) -> np.ndarray:
    """Single-scale baseline (original algo 05)."""
    noise = rng.normal(size=(h, w))
    stretched = gaussian_filter(noise, sigma=(1.5, 24.0))
    field = np.clip(-stretched, 0, None)
    return _norm(_sparsify(field, 94))


def algo05_multiscale_anisotropic(
    h: int,
    w: int,
    rng: np.random.Generator,
    *,
    fine_sigma_x: float = 36.0,
    coarse_sigma_x: float = 58.0,
    fine_keep: float = 86.0,
    coarse_keep: float = 98.5,
    fine_strength: float = 0.48,
) -> np.ndarray:
    """Dual-scale: long fine runs + few large dark majors (matches synthesis defaults)."""
    synth = _load_synth()
    return synth.anisotropic_multiscale_crack_field(
        h,
        w,
        rng,
        fine_sigma_x=fine_sigma_x,
        coarse_sigma_x=coarse_sigma_x,
        fine_keep_percentile=fine_keep,
        coarse_keep_percentile=coarse_keep,
        fine_strength=fine_strength,
    )


def algo06_gabor_horizontal_bank(h: int, w: int, rng: np.random.Generator) -> np.ndarray:
    """Horizontal edge filter bank on noise — picks thin horizontal grooves."""
    noise = rng.normal(size=(h, w))
    field = np.zeros((h, w), dtype=np.float64)
    for sigma_x in (8.0, 14.0, 22.0):
        smooth = gaussian_filter(noise, sigma=(1.2, sigma_x))
        grad_y = np.gradient(smooth, axis=0)
        field += np.clip(-grad_y, 0, None) / sigma_x
    field = _sparsify(field, 91)
    field = grey_opening(field, size=(3, max(12, w // 20)))
    return _norm(field)


def algo07_distance_ridge_centerlines(
    synth, base: np.ndarray, h: int, w: int, rng: np.random.Generator
) -> np.ndarray:
    """Synthetic valleys → binary → distance-transform ridge lines."""
    height = synth.synthetic_height_field(base, h, w, rng)
    coarse = synth._aniso_blur(height, min(h, w) / 22, min(h, w) / 14)
    valleys = np.clip(gaussian_filter(coarse, sigma=20) - coarse, 0, None)
    valleys = _sparsify(valleys, 88)
    binary = (valleys > valleys.max() * 0.35).astype(np.uint8)
    if binary.sum() == 0:
        return _norm(valleys)
    dist = distance_transform_edt(binary)
    ridge = (maximum_filter(dist, size=(3, 9)) == dist) & binary.astype(bool)
    field = gaussian_filter(ridge.astype(np.float64), sigma=0.6)
    return _norm(field)


def algo08_fft_horizontal_crack_spectrum(
    h: int, w: int, rng: np.random.Generator, win: np.ndarray
) -> np.ndarray:
    """Artificial horizontally-elongated spectrum — no photo measurement."""
    # Build synthetic magnitude: energy along horizontal frequency axis
    fy = np.fft.fftfreq(h)
    fx = np.fft.fftfreq(w)
    mag = np.zeros((h, w), dtype=np.float64)
    for i in range(h):
        for j in range(w):
            horiz = abs(fx[j]) / (abs(fy[i]) + 0.02)
            if horiz > 2.0 and abs(fx[j]) > 0.01:
                mag[i, j] = horiz ** -1.2
    mag = gaussian_filter(mag, sigma=1.5)
    mag = np.fft.ifftshift(mag)
    mag[0, 0] = 0.0
    mag /= mag.max() + 1e-8
    noise = rng.normal(size=(h, w))
    field = np.fft.ifft2(np.fft.fft2(noise * win) * mag).real
    field = np.clip(-field, 0, None)
    field = _sparsify(field, 93)
    return _norm(field)


def algo09_stress_curve_faults(h: int, w: int, rng: np.random.Generator) -> np.ndarray:
    """Few random horizontal fault curves (noisy y-offset along x)."""
    field = np.zeros((h, w), dtype=np.float64)
    for _ in range(rng.integers(4, 8)):
        y0 = rng.uniform(h * 0.15, h * 0.85)
        x0 = int(rng.integers(0, int(w * 0.15)))
        length = int(rng.integers(int(w * 0.35), int(w * 0.85)))
        thick = rng.uniform(2.0, 4.5)
        phase = rng.uniform(0, np.pi * 2)
        amp = rng.uniform(1.0, 4.0)
        freq = rng.uniform(0.008, 0.025)
        for xi in range(length):
            x = x0 + xi
            if x >= w:
                break
            y = int(y0 + amp * np.sin(freq * xi + phase) + rng.normal(0, 0.8))
            t = xi / max(length, 1)
            taper = float(np.sin(np.pi * t) ** 0.7)
            yy = int(np.clip(y, 0, h - 1))
            rad = max(1, int(thick * taper * 0.45))
            for dy in range(-rad, rad + 1):
                yi = yy + dy
                if 0 <= yi < h:
                    field[yi, x] = max(field[yi, x], taper)
    return _norm(field)


def algo10_fragment_cluster_field(h: int, w: int, rng: np.random.Generator) -> np.ndarray:
    """Clustered short tapered fragments — mimics broken checking runs."""
    field = np.zeros((h, w), dtype=np.float64)
    n_clusters = int(rng.integers(6, 12))
    for _ in range(n_clusters):
        cy = int(rng.integers(h * 0.08, h * 0.92))
        cx = int(rng.integers(0, int(w * 0.5)))
        n_frag = int(rng.integers(3, 9))
        for _ in range(n_frag):
            y = cy + int(rng.integers(-6, 7))
            x0 = cx + int(rng.integers(-20, 40))
            length = int(rng.integers(int(w * 0.04), int(w * 0.18)))
            _paint_tapered_dash(field, y, x0, length, rng.uniform(1.2, 3.0), rng, 0.25)
    return _norm(field)


def reference_target_mask(synth, img: np.ndarray) -> np.ndarray:
    """Scoring reference only — not one of the 10 algorithms."""
    base_tone = gaussian_filter(img, sigma=18.0)
    crack = np.clip(base_tone - img, 0, None)
    crack = synth._sparsify_crack_real(crack, 92.0)
    return synth._normalize_crack_field(crack)


def score_mask(bw: np.ndarray, ref_bw: np.ndarray) -> tuple[float, int, float]:
    c = 1.0 - bw.astype(np.float64) / 255.0
    r = 1.0 - ref_bw.astype(np.float64) / 255.0
    corr = float(np.corrcoef(c.ravel(), r.ravel())[0, 1])
    binary = (c > 0.3).astype(np.uint8)
    _, n = cc_label(binary, structure=generate_binary_structure(2, 2))
    blob = float(binary.sum()) / max(n, 1)
    return corr, n, blob


def build_montage(entries: list[tuple[str, Path]], out_path: Path, title: str) -> None:
    sample = Image.open(entries[0][1])
    cw, ch = sample.size
    label_h = 40
    gap = 8
    pad = 12
    cols = 5
    rows_n = 2
    width = pad * 2 + cols * cw + (cols - 1) * gap
    height = pad * 2 + 20 + rows_n * (label_h + ch) + gap
    canvas = Image.new("RGB", (width, height), (24, 24, 24))
    draw = ImageDraw.Draw(canvas)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 9)
        font_b = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 11)
    except OSError:
        font = font_b = ImageFont.load_default()
    draw.text((pad, pad), title, fill=(220, 220, 220), font=font_b)
    for i, (label, path) in enumerate(entries):
        col = i % cols
        row = i // cols
        x = pad + col * (cw + gap)
        y = pad + 20 + row * (label_h + ch + gap)
        # wrap long labels
        draw.text((x, y), label, fill=(175, 175, 175), font=font)
        canvas.paste(Image.open(path).convert("L"), (x, y + label_h))
    canvas.save(out_path)


def main() -> None:
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "design/progression/patches/wood-01.png"
    out_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / "design/progression/crack-mask-tries"
    art_dir = Path("/opt/cursor/artifacts")
    out_dir.mkdir(parents=True, exist_ok=True)

    synth = _load_synth()
    img = np.asarray(Image.open(source).convert("L"), dtype=float)
    h, w = img.shape
    win = np.outer(np.hanning(h), np.hanning(w))
    rng0 = np.random.default_rng(0)
    img_c = img - img.mean()
    spec = np.fft.fft2(img_c * win)
    mag_shifted = gaussian_filter(np.fft.fftshift(np.abs(spec)), sigma=synth.SPEC_SMOOTH_SIGMA)
    filt = np.fft.ifftshift(mag_shifted)
    filt[0, 0] = 0.0
    filt = filt / (filt.max() + 1e-8)
    base = np.fft.ifft2(np.fft.fft2(rng0.normal(size=(h, w))) * filt).real
    base = (base - base.mean()) / (base.std() + 1e-8)

    ref_field = reference_target_mask(synth, img)
    ref_path = out_dir / "00_reference_target_only_scoring.png"
    Image.fromarray(_crack_bw(ref_field), mode="L").save(ref_path)
    ref_bw = np.asarray(Image.open(ref_path).convert("L"))

    algorithms: list[tuple[str, str, callable]] = [
        ("01", "Heeger–Bergen (synthetic target)", lambda: algo01_heeger_bergen(synth, h, w, np.random.default_rng(1), win)),
        ("02", "Morphological valleys", lambda: algo02_morphological_valleys(synth, base, h, w, np.random.default_rng(2))),
        ("03", "Tapered dash scatter", lambda: algo03_tapered_dash_scatter(h, w, np.random.default_rng(3))),
        ("04", "Poisson horizontal runs", lambda: algo04_poisson_horizontal_runs(h, w, np.random.default_rng(4))),
        ("05", "Anisotropic multiscale", lambda: algo05_multiscale_anisotropic(h, w, np.random.default_rng(5), fine_keep=82, coarse_keep=98, coarse_sigma_x=42)),
        ("06", "Gabor horizontal bank", lambda: algo06_gabor_horizontal_bank(h, w, np.random.default_rng(6))),
        ("07", "Distance-ridge centerlines", lambda: algo07_distance_ridge_centerlines(synth, base, h, w, np.random.default_rng(7))),
        ("08", "FFT horizontal crack spectrum", lambda: algo08_fft_horizontal_crack_spectrum(h, w, np.random.default_rng(8), win)),
        ("09", "Stress-curve faults", lambda: algo09_stress_curve_faults(h, w, np.random.default_rng(9))),
        ("10", "Fragment cluster field", lambda: algo10_fragment_cluster_field(h, w, np.random.default_rng(10))),
    ]

    print("10 GENERATIVE algorithms (reference = extracted target, scoring only)")
    print(f"{'algo':<6} {'name':<28} {'corr':>7} {'#cc':>6} {'blob':>8}")
    print("-" * 62)

    entries: list[tuple[str, Path]] = []
    ranked: list[tuple[float, str, Path]] = []

    for num, name, fn in algorithms:
        field = fn()
        slug = f"algo{num}_{name.lower().replace(' ', '_').replace('–', '')[:40]}"
        path = out_dir / f"{slug}.png"
        Image.fromarray(_crack_bw(field), mode="L").save(path)
        bw = np.asarray(Image.open(path).convert("L"))
        corr, n, blob = score_mask(bw, ref_bw)
        print(f"{num:<6} {name:<28} {corr:7.4f} {n:6d} {blob:8.0f}")
        ranked.append((corr, f"{num} {name} corr={corr:.2f}", path))

    ranked.sort(key=lambda x: -x[0])
    for _, label, path in ranked:
        entries.append((label, path))

    montage = art_dir / "ten_generative_crack_algorithms.png"
    build_montage(
        entries,
        montage,
        "10 generative crack-mask algorithms (ranked by corr to target form)",
    )
    print(f"\nReference (scoring only): {ref_path}")
    print(f"Masks: {out_dir}")
    print(f"Montage: {montage}")


if __name__ == "__main__":
    main()
