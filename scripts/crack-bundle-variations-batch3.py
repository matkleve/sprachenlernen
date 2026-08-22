#!/usr/bin/env python3
"""Batch 3: grain-crease family × 5 variations — anchored on batch2 winner.

Winner reference (batch2 row 5 col 2):
  grain_crease_sparse blur_y=1.5 blur_x=12 keep=90 neg=0.35 grad=1.0

Five bundles explore σx, density, weight mix, dual-layer max, and post-sharpen.

Usage:
    python3 scripts/crack-bundle-variations-batch3.py [source.png] [out_dir]
"""

from __future__ import annotations

import importlib.util
import sys
import time
from dataclasses import dataclass
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy.ndimage import gaussian_filter, grey_opening

ROOT = Path(__file__).resolve().parents[1]
SYNTH_PATH = ROOT / "scripts/wood-grain-fourier-synthesis.py"
DEFAULT_SOURCE = ROOT / "design/progression/patches/wood-01.png"
DEFAULT_OUT = ROOT / "design/progression/crack-mask-tries/bundles-batch3"
ARTIFACTS = Path("/opt/cursor/artifacts")

# Batch2 winner — grain crease v2
ANCHOR = {
    "pre_blur_y": 1.5,
    "pre_blur_x": 12.0,
    "keep_p": 90.0,
    "neg_weight": 0.35,
    "grad_weight": 1.0,
    "thin_frac": 0.018,
}


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


def grain_crease_sparse(
    base: np.ndarray,
    *,
    pre_blur_y: float,
    pre_blur_x: float,
    keep_p: float,
    neg_weight: float,
    grad_weight: float,
    thin_frac: float = 0.018,
    post_blur_y: float = 0.0,
    post_blur_x: float = 0.0,
) -> np.ndarray:
    smooth = gaussian_filter(base, sigma=(pre_blur_y, pre_blur_x))
    grad_y = np.gradient(smooth, axis=0)
    dark = np.clip(-smooth, 0, None)
    crease = np.clip(-grad_y, 0, None)
    field = dark * neg_weight + crease * grad_weight
    field = _sparsify(field, keep_p)
    thin_w = max(6, int(base.shape[1] * thin_frac))
    field = grey_opening(field, size=(3, thin_w))
    if post_blur_y > 0 or post_blur_x > 0:
        field = gaussian_filter(field, sigma=(post_blur_y, post_blur_x))
    return _norm(field)


def grain_crease_dual(
    base: np.ndarray,
    layer_a: dict,
    layer_b: dict,
    weight_a: float,
    weight_b: float,
) -> np.ndarray:
    a = grain_crease_sparse(base, **layer_a)
    b = grain_crease_sparse(base, **layer_b)
    return _norm(np.maximum(a * weight_a, b * weight_b))


@dataclass(frozen=True)
class Variation:
    label: str
    kind: str
    params: dict


@dataclass(frozen=True)
class Bundle:
    slug: str
    title: str
    variations: tuple[Variation, ...]


def _p(**overrides) -> dict:
    out = dict(ANCHOR)
    out.update(overrides)
    return out


def _bundles() -> tuple[Bundle, ...]:
    return (
        Bundle(
            "b3_01_anchor_core",
            "Grain crease — anchor + nudges",
            (
                Variation("★ winner blur1.5,12 k90", "single", _p()),
                Variation("blur_x14", "single", _p(pre_blur_x=14.0)),
                Variation("blur_x10", "single", _p(pre_blur_x=10.0)),
                Variation("keep88 denser", "single", _p(keep_p=88.0)),
                Variation("keep92 sparser", "single", _p(keep_p=92.0)),
            ),
        ),
        Bundle(
            "b3_02_sigma_x_sweep",
            "Grain crease — horizontal blur σx",
            (
                Variation("σx8", "single", _p(pre_blur_x=8.0)),
                Variation("σx10", "single", _p(pre_blur_x=10.0)),
                Variation("★ σx12 anchor", "single", _p(pre_blur_x=12.0)),
                Variation("σx14", "single", _p(pre_blur_x=14.0)),
                Variation("σx16", "single", _p(pre_blur_x=16.0)),
            ),
        ),
        Bundle(
            "b3_03_density_sweep",
            "Grain crease — keep percentile",
            (
                Variation("k86 dense", "single", _p(keep_p=86.0)),
                Variation("k88", "single", _p(keep_p=88.0)),
                Variation("★ k90 anchor", "single", _p(keep_p=90.0)),
                Variation("k92", "single", _p(keep_p=92.0)),
                Variation("k94 sparse", "single", _p(keep_p=94.0)),
            ),
        ),
        Bundle(
            "b3_04_weight_mix",
            "Grain crease — dark vs crease weights",
            (
                Variation("★ grad1.0 neg0.35", "single", _p(neg_weight=0.35, grad_weight=1.0)),
                Variation("grad1.2 sharp", "single", _p(neg_weight=0.25, grad_weight=1.2)),
                Variation("grad0.85 soft", "single", _p(neg_weight=0.40, grad_weight=0.85)),
                Variation("dark-heavy neg0.55", "single", _p(neg_weight=0.55, grad_weight=0.75)),
                Variation("crease-only grad1.1", "single", _p(neg_weight=0.15, grad_weight=1.1)),
            ),
        ),
        Bundle(
            "b3_05_dual_layer",
            "Grain crease dual max(micro,fine)",
            (
                Variation("micro6+anchor", "dual", {
                    "layer_a": _p(pre_blur_y=0.8, pre_blur_x=6.0, keep_p=88.0),
                    "layer_b": _p(),
                    "weight_a": 0.65, "weight_b": 1.0,
                }),
                Variation("micro8+anchor", "dual", {
                    "layer_a": _p(pre_blur_y=1.0, pre_blur_x=8.0, keep_p=89.0),
                    "layer_b": _p(),
                    "weight_a": 0.7, "weight_b": 1.0,
                }),
                Variation("★ anchor+wide14", "dual", {
                    "layer_a": _p(),
                    "layer_b": _p(pre_blur_x=14.0, keep_p=92.0, neg_weight=0.3),
                    "weight_a": 1.0, "weight_b": 0.75,
                }),
                Variation("micro+wide balanced", "dual", {
                    "layer_a": _p(pre_blur_y=1.0, pre_blur_x=8.0, keep_p=87.0),
                    "layer_b": _p(pre_blur_x=14.0, keep_p=91.0),
                    "weight_a": 0.6, "weight_b": 0.8,
                }),
                Variation("triple-scale max", "triple", {
                    "layers": [
                        (_p(pre_blur_y=0.8, pre_blur_x=6.0, keep_p=88.0), 0.55),
                        (_p(), 1.0),
                        (_p(pre_blur_x=16.0, keep_p=93.0, neg_weight=0.3), 0.65),
                    ],
                }),
            ),
        ),
    )


def _generate(
    var: Variation,
    base: np.ndarray,
) -> np.ndarray:
    p = var.params
    if var.kind == "single":
        return grain_crease_sparse(base, **p)
    if var.kind == "dual":
        return grain_crease_dual(
            base, p["layer_a"], p["layer_b"], p["weight_a"], p["weight_b"],
        )
    if var.kind == "triple":
        combined = np.zeros_like(base, dtype=np.float64)
        for layer_p, weight in p["layers"]:
            combined = np.maximum(combined, grain_crease_sparse(base, **layer_p) * weight)
        return _norm(combined)
    raise ValueError(var.kind)


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
            field = _generate(var, base)
            tag = f"{bundle.slug}_v{vi + 1}"
            bw = _crack_bw(field)
            Image.fromarray(bw, mode="L").save(out_dir / f"{tag}.png")
            row.append((var.label, Image.fromarray(bw, mode="L")))
            print(f"[{tag}] {var.label}")
        grid_rows.append(row)
        strip = _montage_grid(
            [row], [bundle.title], thumb=160, label_h=36,
            title=f"Batch3: {bundle.title}",
        )
        strip.save(out_dir / f"{bundle.slug}_strip.png")
        strip.save(ARTIFACTS / f"crack_bundle3_{bundle.slug}.png")

    mega = _montage_grid(
        grid_rows, row_titles, thumb=140, label_h=32,
        title="Batch 3 — grain crease family (anchor: blur1.5,12 k90)",
    )
    mega.save(out_dir / "montage_5x5.png")
    mega.save(ARTIFACTS / "crack_bundles_batch3_5x5_montage.png")

    elapsed = time.perf_counter() - t0
    print(f"\nDone batch3 25 in {elapsed:.1f}s")
    print(f"Montage: {ARTIFACTS / 'crack_bundles_batch3_5x5_montage.png'}")


if __name__ == "__main__":
    main()
