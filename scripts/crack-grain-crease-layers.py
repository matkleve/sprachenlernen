#!/usr/bin/env python3
"""Three grain-crease depth layers with horizontal stretch + RGB composite.

Layers (same primitive, different length/width/spectrum/amount):
  L0 micro  — blue   — short dense creases
  L1 fine   — orange — anchor-scale runs (batch2 winner, stretched)
  L2 major  — red    — long wide faults

Five variations sweep horizontal stretch (close + blur_x).

Usage:
    python3 scripts/crack-grain-crease-layers.py [source.png] [out_dir]
"""

from __future__ import annotations

import importlib.util
import sys
from dataclasses import dataclass
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy.ndimage import gaussian_filter, grey_closing, grey_opening

ROOT = Path(__file__).resolve().parents[1]
SYNTH_PATH = ROOT / "scripts/wood-grain-fourier-synthesis.py"
DEFAULT_SOURCE = ROOT / "design/progression/patches/wood-01.png"
DEFAULT_OUT = ROOT / "design/progression/crack-mask-tries/layers-rgb"
ARTIFACTS = Path("/opt/cursor/artifacts")

# Layer colors on white (RGB)
LAYER_COLORS = {
    "micro": (33, 150, 243),    # blue
    "fine": (245, 124, 0),      # orange
    "major": (183, 28, 28),     # red
}


@dataclass(frozen=True)
class LayerSpec:
    name: str
    pre_blur_y: float
    pre_blur_x: float
    keep_p: float
    neg_weight: float
    grad_weight: float
    close_x_frac: float
    stretch_blur_x: float
    thin_frac: float = 0.016
    post_thin_frac: float = 0.0
    layer_stretch_mul: float = 1.0


def _load_synth():
    spec = importlib.util.spec_from_file_location("wood_synth", SYNTH_PATH)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


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


def grain_crease_layer(base: np.ndarray, spec: LayerSpec, stretch_mul: float = 1.0) -> np.ndarray:
    """One depth layer with horizontal stretch to lengthen runs along grain."""
    h, w = base.shape
    total_mul = stretch_mul * spec.layer_stretch_mul
    blur_x = spec.pre_blur_x * total_mul
    smooth = gaussian_filter(base, sigma=(spec.pre_blur_y, blur_x))
    grad_y = np.gradient(smooth, axis=0)
    dark = np.clip(-smooth, 0, None)
    crease = np.clip(-grad_y, 0, None)
    field = dark * spec.neg_weight + crease * spec.grad_weight
    field = _sparsify(field, spec.keep_p)

    close_frac = spec.close_x_frac * total_mul
    if close_frac > 0:
        close_w = max(14, int(w * close_frac))
        field = grey_closing(field, size=(3, close_w))

    thin_w = max(3, int(w * spec.thin_frac))
    field = grey_opening(field, size=(3, thin_w))

    stretch_x = spec.stretch_blur_x * total_mul
    if stretch_x > 0:
        field = gaussian_filter(field, sigma=(0.22, stretch_x))

    if spec.post_thin_frac > 0:
        post_w = max(3, int(w * spec.post_thin_frac))
        field = grey_opening(field, size=(3, post_w))

    peak = float(field.max())
    return field / (peak + 1e-8) if peak > 0 else field


def _layer_specs() -> tuple[LayerSpec, LayerSpec, LayerSpec]:
    # Micro: hairline, long, dense — extra stretch_mul vs other layers
    micro = LayerSpec(
        "micro",
        pre_blur_y=0.42,
        pre_blur_x=18.0,
        keep_p=79.0,
        neg_weight=0.12,
        grad_weight=1.35,
        close_x_frac=0.30,
        stretch_blur_x=22.0,
        thin_frac=0.006,
        post_thin_frac=0.004,
        layer_stretch_mul=1.4,
    )
    fine = LayerSpec(
        "fine", 1.2, 18.0, 89.0, 0.32, 1.0, 0.11, 9.0, 0.016,
    )
    major = LayerSpec(
        "major", 1.8, 28.0, 93.0, 0.28, 0.85, 0.20, 16.0, 0.018,
    )
    return micro, fine, major


def micro_only_rgb(micro: np.ndarray) -> np.ndarray:
    h, w = micro.shape
    rgb = np.full((h, w, 3), 255.0, dtype=np.float64)
    color = LAYER_COLORS["micro"]
    alpha = np.clip(micro, 0, 1)
    for c in range(3):
        rgb[:, :, c] = rgb[:, :, c] * (1.0 - alpha) + color[c] * alpha
    return np.clip(rgb, 0, 255).astype(np.uint8)


def composite_rgb(
    micro: np.ndarray,
    fine: np.ndarray,
    major: np.ndarray,
    *,
    bg: float = 255.0,
) -> np.ndarray:
    """Paint layers on white — later layer wins where stronger."""
    h, w = micro.shape
    rgb = np.full((h, w, 3), bg, dtype=np.float64)
    for field, color in [
        (micro, LAYER_COLORS["micro"]),
        (fine, LAYER_COLORS["fine"]),
        (major, LAYER_COLORS["major"]),
    ]:
        alpha = np.clip(field, 0, 1)
        for c in range(3):
            rgb[:, :, c] = rgb[:, :, c] * (1.0 - alpha) + color[c] * alpha
    return np.clip(rgb, 0, 255).astype(np.uint8)


def composite_legend(height: int = 48) -> Image.Image:
    img = Image.new("RGB", (280, height), (28, 28, 28))
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 11)
    except OSError:
        font = ImageFont.load_default()
    x = 8
    for name, color in LAYER_COLORS.items():
        draw.rectangle((x, 10, x + 18, 28), fill=color)
        draw.text((x + 24, 12), name, fill=(220, 220, 220), font=font)
        x += 88
    return img


def _montage_row(
    panels: list[tuple[str, Image.Image]],
    title: str,
    thumb: int = 200,
) -> Image.Image:
    label_h = 28
    pad = 8
    width = pad * 2 + len(panels) * (thumb + pad)
    height = pad * 2 + 24 + thumb + label_h
    canvas = Image.new("RGB", (width, height), (22, 22, 22))
    draw = ImageDraw.Draw(canvas)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 9)
        font_b = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 11)
    except OSError:
        font = font_b = ImageFont.load_default()
    draw.text((pad, pad), title, fill=(230, 230, 230), font=font_b)
    y = pad + 24
    for i, (label, im) in enumerate(panels):
        x = pad + i * (thumb + pad)
        t = im.resize((thumb, thumb), Image.Resampling.LANCZOS)
        canvas.paste(t, (x, y))
        draw.text((x + 2, y + thumb + 2), label[:36], fill=(170, 170, 170), font=font)
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
    spec_fft = np.fft.fft2(img_c * win)
    mag = gaussian_filter(np.fft.fftshift(np.abs(spec_fft)), sigma=synth.SPEC_SMOOTH_SIGMA)
    filt = np.fft.ifftshift(mag)
    filt[0, 0] = 0.0
    filt = filt / (filt.max() + 1e-8)
    base = np.fft.ifft2(np.fft.fft2(rng0.normal(size=(h, w))) * filt).real
    base = (base - base.mean()) / (base.std() + 1e-8)

    micro_spec, fine_spec, major_spec = _layer_specs()
    stretch_levels = [
        ("stretch×1.0", 1.0),
        ("stretch×1.25", 1.25),
        ("stretch×1.5", 1.5),
        ("stretch×1.75", 1.75),
        ("stretch×2.0", 2.0),
    ]

    rgb_panels: list[tuple[str, Image.Image]] = []
    layer_rows: list[list[tuple[str, Image.Image]]] = [[], [], []]

    for label, mul in stretch_levels:
        micro = grain_crease_layer(base, micro_spec, stretch_mul=mul)
        fine = grain_crease_layer(base, fine_spec, stretch_mul=mul)
        major = grain_crease_layer(base, major_spec, stretch_mul=mul)
        combined = np.maximum(np.maximum(micro, fine), major)

        tag = label.replace("×", "x").replace(".", "p")
        Image.fromarray(composite_rgb(micro, fine, major)).save(
            out_dir / f"rgb_{tag}.png"
        )
        for name, field in [("micro", micro), ("fine", fine), ("major", major)]:
            peak = float(field.max())
            bw = (255 - np.clip(field / (peak + 1e-8) * 255, 0, 255)).astype(np.uint8)
            Image.fromarray(bw, mode="L").save(out_dir / f"{tag}_{name}.png")

        peak = float(combined.max())
        comb_bw = (255 - np.clip(combined / (peak + 1e-8) * 255, 0, 255)).astype(np.uint8)
        Image.fromarray(comb_bw, mode="L").save(out_dir / f"{tag}_combined.png")

        rgb_im = Image.fromarray(composite_rgb(micro, fine, major))
        rgb_panels.append((label, rgb_im))

        for idx, (name, field) in enumerate(
            [("micro", micro), ("fine", fine), ("major", major)]
        ):
            peak = float(field.max())
            bw = (255 - np.clip(field / (peak + 1e-8) * 255, 0, 255)).astype(np.uint8)
            layer_rows[idx].append((label, Image.fromarray(bw, mode="L")))

        print(f"[{label}] micro/fine/major + rgb")

    # RGB stretch sweep montage
    legend = composite_legend()
    stretch_montage = _montage_row(rgb_panels, "3 layers RGB — blue micro · orange fine · red major")
    full = Image.new(
        "RGB",
        (max(stretch_montage.width, legend.width + 20), stretch_montage.height + legend.height + 8),
        (22, 22, 22),
    )
    full.paste(legend, (8, 0))
    full.paste(stretch_montage, (0, legend.height + 8))
    full.save(out_dir / "montage_rgb_stretch_sweep.png")
    full.save(ARTIFACTS / "crack_layers_rgb_stretch_sweep.png")

    # Per-layer rows (5 stretch levels each)
    layer_names = ["L0 micro (blue)", "L1 fine (orange)", "L2 major (red)"]
    layer_montages = []
    for row, lname in zip(layer_rows, layer_names):
        m = _montage_row(row, lname, thumb=160)
        layer_montages.append(m)
        m.save(out_dir / f"montage_{lname.split()[1]}.png")

    # Stack layer montages vertically
    lw = max(m.width for m in layer_montages)
    lh = sum(m.height for m in layer_montages)
    stack = Image.new("RGB", (lw, lh), (22, 22, 22))
    y = 0
    for m in layer_montages:
        stack.paste(m, (0, y))
        y += m.height
    stack.save(ARTIFACTS / "crack_layers_by_depth_stretch.png")

    # Hero: full RGB + micro-only at stretch×1.5
    hero = rgb_panels[2][1]
    hero.save(ARTIFACTS / "crack_layers_rgb_hero_stretch1p5.png")

    micro_hero = grain_crease_layer(base, micro_spec, stretch_mul=1.5)
    Image.fromarray(micro_only_rgb(micro_hero)).save(
        out_dir / "micro_only_stretch1p5.png"
    )
    Image.fromarray(micro_only_rgb(micro_hero)).save(
        ARTIFACTS / "crack_micro_blue_tuned.png"
    )

    # Micro density sweep (5 knobs on blue layer only)
    micro_sweep = [
        ("dense k77", 77.0, 1.4),
        ("★ tuned k79", 79.0, 1.4),
        ("k81", 81.0, 1.4),
        ("longer close×1.6", 79.0, 1.6),
        ("longest close×1.8", 79.0, 1.8),
    ]
    micro_panels: list[tuple[str, Image.Image]] = []
    for label, keep, lmul in micro_sweep:
        tuned = LayerSpec(
            micro_spec.name,
            micro_spec.pre_blur_y,
            micro_spec.pre_blur_x,
            keep,
            micro_spec.neg_weight,
            micro_spec.grad_weight,
            micro_spec.close_x_frac,
            micro_spec.stretch_blur_x,
            micro_spec.thin_frac,
            micro_spec.post_thin_frac,
            layer_stretch_mul=lmul,
        )
        field = grain_crease_layer(base, tuned, stretch_mul=1.5)
        micro_panels.append((label, Image.fromarray(micro_only_rgb(field))))
    micro_montage = _montage_row(
        micro_panels, "L0 micro (blue) — thinner · longer · more",
    )
    micro_montage.save(ARTIFACTS / "crack_micro_blue_sweep.png")

    print(f"\nOut: {out_dir}")
    print(f"RGB sweep: {ARTIFACTS / 'crack_layers_rgb_stretch_sweep.png'}")
    print(f"Micro tuned: {ARTIFACTS / 'crack_micro_blue_tuned.png'}")


if __name__ == "__main__":
    main()
