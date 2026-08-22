#!/usr/bin/env python3
"""Five best crack-mask bundles × five parameter variations (25 masks + montages).

Bundles:
  1. extracted      — photo relu(blur−photo); spectrum + sparsify knobs
  2. morphological  — synthetic topography valleys
  3. poisson        — scattered broken horizontal runs (closest generative scatter)
  4. fragment       — clustered short tapered fragments
  5. layer_stack    — max(micro poisson, fine fragments, major morph)

Usage:
    python3 scripts/crack-bundle-variations.py [source.png] [out_dir]
"""

from __future__ import annotations

import importlib.util
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Callable

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy.ndimage import gaussian_filter

ROOT = Path(__file__).resolve().parents[1]
SYNTH_PATH = ROOT / "scripts/design/wood-grain-fourier-synthesis.py"
DEFAULT_SOURCE = ROOT / "design/progression/patches/wood-01.png"
DEFAULT_OUT = ROOT / "design/progression/crack-mask-tries/bundles"
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


def _paint_tapered_dash(
    field: np.ndarray,
    y: int,
    x0: int,
    length: int,
    thickness: float,
    rng: np.random.Generator,
    gap_prob: float,
    taper_power: float = 0.65,
) -> None:
    h, w = field.shape
    y = int(np.clip(y + rng.integers(-2, 3), 0, h - 1))
    for x in range(max(0, x0), min(w, x0 + length)):
        if rng.random() < gap_prob:
            continue
        t = (x - x0) / max(length, 1)
        taper = float(np.sin(np.pi * t) ** taper_power)
        yy = int(np.clip(y + rng.integers(-1, 2), 0, h - 1))
        rad = max(1, int(thickness * taper * 0.5))
        for dy in range(-rad, rad + 1):
            yi = yy + dy
            if 0 <= yi < h:
                field[yi, x] = max(field[yi, x], taper)


def poisson_runs(
    h: int,
    w: int,
    rng: np.random.Generator,
    *,
    n_lines: int,
    len_min_frac: float,
    len_max_frac: float,
    thick_min: float,
    thick_max: float,
    gap_min: float,
    gap_max: float,
    taper_power: float = 0.65,
) -> np.ndarray:
    field = np.zeros((h, w), dtype=np.float64)
    ys = rng.integers(0, h, size=n_lines)
    for y in ys:
        x0 = int(rng.integers(0, int(w * 0.55)))
        run_len = int(rng.integers(int(w * len_min_frac), int(w * len_max_frac)))
        thick = rng.uniform(thick_min, thick_max)
        gap = rng.uniform(gap_min, gap_max)
        _paint_tapered_dash(
            field, int(y), x0, run_len, thick, rng, gap, taper_power=taper_power
        )
    return _norm(field)


def fragment_clusters(
    h: int,
    w: int,
    rng: np.random.Generator,
    *,
    n_clusters: int,
    frag_min: int,
    frag_max: int,
    len_min_frac: float,
    len_max_frac: float,
    thick_min: float,
    thick_max: float,
    gap_prob: float,
    y_jitter: int = 6,
) -> np.ndarray:
    field = np.zeros((h, w), dtype=np.float64)
    for _ in range(n_clusters):
        cy = int(rng.integers(int(h * 0.06), int(h * 0.94)))
        cx = int(rng.integers(0, int(w * 0.55)))
        n_frag = int(rng.integers(frag_min, frag_max + 1))
        for _ in range(n_frag):
            y = cy + int(rng.integers(-y_jitter, y_jitter + 1))
            x0 = cx + int(rng.integers(-24, 36))
            length = int(rng.integers(int(w * len_min_frac), int(w * len_max_frac)))
            _paint_tapered_dash(
                field,
                y,
                x0,
                length,
                rng.uniform(thick_min, thick_max),
                rng,
                gap_prob,
            )
    return _norm(field)


def morph_major_only(
    synth,
    base: np.ndarray,
    h: int,
    w: int,
    rng: np.random.Generator,
    *,
    crack_blur_sigma: float,
    keep_percentile: float,
) -> np.ndarray:
    """Wide blur-difference majors on synthetic hills — no fine valley soup."""
    height = synth.synthetic_height_field(base, h, w, rng)
    span = min(h, w)
    coarse = synth._aniso_blur(height, span / 22.0, span / 14.0)
    major = np.clip(
        synth._aniso_blur(coarse, crack_blur_sigma * 0.35, crack_blur_sigma) - coarse,
        0,
        None,
    )
    major = synth._sparsify_crack_real(major, keep_percentile)
    return synth._normalize_crack_field(major)


def layer_stack(
    synth,
    base: np.ndarray,
    h: int,
    w: int,
    rng: np.random.Generator,
    *,
    micro: dict,
    fine: dict,
    major: dict,
    micro_w: float,
    fine_w: float,
    major_w: float,
) -> np.ndarray:
    rng_m = np.random.default_rng(rng.integers(0, 2**31))
    rng_f = np.random.default_rng(rng.integers(0, 2**31))
    rng_j = np.random.default_rng(rng.integers(0, 2**31))
    m = poisson_runs(h, w, rng_m, **micro) * micro_w
    f = fragment_clusters(h, w, rng_f, **fine) * fine_w
    j = morph_major_only(synth, base, h, w, rng_j, **major) * major_w
    return _norm(np.maximum(np.maximum(m, f), j))


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
            "01_extracted",
            "Extracted (photo)",
            (
                Variation("majors-only σ14 k94", {"blur_sigma": 14.0, "keep_p": 94.0}),
                Variation("target σ18 k92", {"blur_sigma": 18.0, "keep_p": 92.0}),
                Variation("more-fine σ18 k88", {"blur_sigma": 18.0, "keep_p": 88.0}),
                Variation("wide σ22 k90", {"blur_sigma": 22.0, "keep_p": 90.0}),
                Variation("big-only σ26 k92", {"blur_sigma": 26.0, "keep_p": 92.0}),
            ),
        ),
        Bundle(
            "02_morphological",
            "Morphological valleys",
            (
                Variation("σ14 k88 thin", {"blur_sigma": 14.0, "keep_p": 88.0}),
                Variation("σ18 k90", {"blur_sigma": 18.0, "keep_p": 90.0}),
                Variation("σ18 k92", {"blur_sigma": 18.0, "keep_p": 92.0}),
                Variation("σ22 k90 wide", {"blur_sigma": 22.0, "keep_p": 90.0}),
                Variation("σ22 k94 sparse", {"blur_sigma": 22.0, "keep_p": 94.0}),
            ),
        ),
        Bundle(
            "03_poisson",
            "Poisson horizontal runs",
            (
                Variation("few-short n40", {
                    "n_lines": 40, "len_min_frac": 0.04, "len_max_frac": 0.22,
                    "thick_min": 0.7, "thick_max": 2.2, "gap_min": 0.22, "gap_max": 0.38,
                }),
                Variation("medium n70", {
                    "n_lines": 70, "len_min_frac": 0.06, "len_max_frac": 0.32,
                    "thick_min": 0.8, "thick_max": 2.6, "gap_min": 0.14, "gap_max": 0.28,
                }),
                Variation("dense n100", {
                    "n_lines": 100, "len_min_frac": 0.05, "len_max_frac": 0.38,
                    "thick_min": 0.7, "thick_max": 2.4, "gap_min": 0.10, "gap_max": 0.22,
                }),
                Variation("long-runs n55", {
                    "n_lines": 55, "len_min_frac": 0.14, "len_max_frac": 0.52,
                    "thick_min": 1.0, "thick_max": 3.0, "gap_min": 0.06, "gap_max": 0.16,
                }),
                Variation("micro-dense n140", {
                    "n_lines": 140, "len_min_frac": 0.03, "len_max_frac": 0.16,
                    "thick_min": 0.6, "thick_max": 1.8, "gap_min": 0.18, "gap_max": 0.32,
                    "taper_power": 0.55,
                }),
            ),
        ),
        Bundle(
            "04_fragment",
            "Fragment clusters",
            (
                Variation("sparse c6 f3-5", {
                    "n_clusters": 6, "frag_min": 3, "frag_max": 5,
                    "len_min_frac": 0.03, "len_max_frac": 0.12, "thick_min": 1.0,
                    "thick_max": 2.4, "gap_prob": 0.28,
                }),
                Variation("medium c10 f4-7", {
                    "n_clusters": 10, "frag_min": 4, "frag_max": 7,
                    "len_min_frac": 0.04, "len_max_frac": 0.16, "thick_min": 1.1,
                    "thick_max": 2.8, "gap_prob": 0.22,
                }),
                Variation("dense c14 f5-9", {
                    "n_clusters": 14, "frag_min": 5, "frag_max": 9,
                    "len_min_frac": 0.04, "len_max_frac": 0.14, "thick_min": 0.9,
                    "thick_max": 2.5, "gap_prob": 0.20,
                }),
                Variation("long-frags c8 f3-6", {
                    "n_clusters": 8, "frag_min": 3, "frag_max": 6,
                    "len_min_frac": 0.08, "len_max_frac": 0.24, "thick_min": 1.2,
                    "thick_max": 3.0, "gap_prob": 0.14,
                }),
                Variation("micro c18 f6-12", {
                    "n_clusters": 18, "frag_min": 6, "frag_max": 12,
                    "len_min_frac": 0.02, "len_max_frac": 0.10, "thick_min": 0.8,
                    "thick_max": 2.0, "gap_prob": 0.30, "y_jitter": 4,
                }),
            ),
        ),
        Bundle(
            "05_layer_stack",
            "Layer stack max(micro,fine,major)",
            (
                Variation("micro-heavy", {
                    "micro_w": 0.85, "fine_w": 0.45, "major_w": 0.35,
                    "micro": {"n_lines": 120, "len_min_frac": 0.03, "len_max_frac": 0.18,
                              "thick_min": 0.6, "thick_max": 1.8, "gap_min": 0.12, "gap_max": 0.26},
                    "fine": {"n_clusters": 8, "frag_min": 4, "frag_max": 7,
                             "len_min_frac": 0.04, "len_max_frac": 0.14, "thick_min": 1.0,
                             "thick_max": 2.4, "gap_prob": 0.22},
                    "major": {"crack_blur_sigma": 22.0, "keep_percentile": 94.0},
                }),
                Variation("balanced", {
                    "micro_w": 0.55, "fine_w": 0.65, "major_w": 0.70,
                    "micro": {"n_lines": 80, "len_min_frac": 0.05, "len_max_frac": 0.28,
                              "thick_min": 0.7, "thick_max": 2.2, "gap_min": 0.14, "gap_max": 0.28},
                    "fine": {"n_clusters": 10, "frag_min": 4, "frag_max": 8,
                             "len_min_frac": 0.05, "len_max_frac": 0.16, "thick_min": 1.0,
                             "thick_max": 2.6, "gap_prob": 0.20},
                    "major": {"crack_blur_sigma": 18.0, "keep_percentile": 92.0},
                }),
                Variation("major-heavy", {
                    "micro_w": 0.35, "fine_w": 0.40, "major_w": 1.0,
                    "micro": {"n_lines": 50, "len_min_frac": 0.04, "len_max_frac": 0.20,
                              "thick_min": 0.7, "thick_max": 2.0, "gap_min": 0.18, "gap_max": 0.30},
                    "fine": {"n_clusters": 6, "frag_min": 3, "frag_max": 5,
                             "len_min_frac": 0.04, "len_max_frac": 0.12, "thick_min": 1.0,
                             "thick_max": 2.2, "gap_prob": 0.24},
                    "major": {"crack_blur_sigma": 18.0, "keep_percentile": 88.0},
                }),
                Variation("scatter-only", {
                    "micro_w": 0.70, "fine_w": 0.75, "major_w": 0.0,
                    "micro": {"n_lines": 90, "len_min_frac": 0.05, "len_max_frac": 0.30,
                              "thick_min": 0.7, "thick_max": 2.4, "gap_min": 0.12, "gap_max": 0.24},
                    "fine": {"n_clusters": 12, "frag_min": 5, "frag_max": 9,
                             "len_min_frac": 0.04, "len_max_frac": 0.15, "thick_min": 0.9,
                             "thick_max": 2.5, "gap_prob": 0.18},
                    "major": {"crack_blur_sigma": 22.0, "keep_percentile": 95.0},
                }),
                Variation("fine+major", {
                    "micro_w": 0.25, "fine_w": 0.80, "major_w": 0.85,
                    "micro": {"n_lines": 45, "len_min_frac": 0.04, "len_max_frac": 0.16,
                              "thick_min": 0.6, "thick_max": 1.6, "gap_min": 0.20, "gap_max": 0.34},
                    "fine": {"n_clusters": 14, "frag_min": 5, "frag_max": 10,
                             "len_min_frac": 0.06, "len_max_frac": 0.20, "thick_min": 1.0,
                             "thick_max": 2.8, "gap_prob": 0.16},
                    "major": {"crack_blur_sigma": 20.0, "keep_percentile": 90.0},
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
    seed: int,
) -> np.ndarray:
    rng = np.random.default_rng(seed)
    p = var.params

    if bundle.slug == "01_extracted":
        tone = gaussian_filter(img, sigma=p["blur_sigma"])
        crack = np.clip(tone - img, 0, None)
        crack = synth._sparsify_crack_real(crack, p["keep_p"])
        return synth._normalize_crack_field(crack)

    if bundle.slug == "02_morphological":
        height = synth.synthetic_height_field(base, h, w, rng)
        return synth.morphological_crack_field(
            height, keep_percentile=p["keep_p"], crack_blur_sigma=p["blur_sigma"],
        )

    if bundle.slug == "03_poisson":
        kw = {k: v for k, v in p.items()}
        taper = kw.pop("taper_power", 0.65)
        return poisson_runs(h, w, rng, taper_power=taper, **kw)

    if bundle.slug == "04_fragment":
        return fragment_clusters(h, w, rng, **p)

    if bundle.slug == "05_layer_stack":
        micro = dict(p["micro"])
        fine = dict(p["fine"])
        major = dict(p["major"])
        return layer_stack(
            synth, base, h, w, rng,
            micro=micro, fine=fine, major=major,
            micro_w=p["micro_w"], fine_w=p["fine_w"], major_w=p["major_w"],
        )

    raise ValueError(bundle.slug)


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
            draw.text((x + 2, y + thumb + 2), label[:42], fill=(170, 170, 170), font=font)
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
            seed = bi * 1000 + vi * 17 + 42
            field = _generate(bundle, var, synth, img, base, h, w, seed)
            tag = f"{bundle.slug}_v{vi + 1}"
            path = out_dir / f"{tag}.png"
            bw = _crack_bw(field)
            Image.fromarray(bw, mode="L").save(path)
            row.append((var.label, Image.fromarray(bw, mode="L")))
            print(f"[{tag}] {var.label}")
        grid_rows.append(row)

        # per-bundle 1×5 strip
        strip = _montage_grid(
            [row],
            [bundle.title],
            thumb=160,
            label_h=36,
            title=f"Bundle: {bundle.title}",
        )
        strip.save(out_dir / f"{bundle.slug}_strip.png")
        strip.save(ARTIFACTS / f"crack_bundle_{bundle.slug}.png")

    mega = _montage_grid(
        grid_rows,
        row_titles,
        thumb=140,
        label_h=32,
        title="5 crack bundles × 5 parameter variations (25 masks)",
    )
    mega.save(out_dir / "montage_5x5.png")
    mega.save(ARTIFACTS / "crack_bundles_5x5_montage.png")

    elapsed = time.perf_counter() - t0
    print(f"\nDone 25 masks in {elapsed:.1f}s")
    print(f"Out: {out_dir}")
    print(f"Montage: {ARTIFACTS / 'crack_bundles_5x5_montage.png'}")


if __name__ == "__main__":
    main()
