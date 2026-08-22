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
from scipy.ndimage import gaussian_filter, grey_closing, grey_opening, maximum_filter, generate_binary_structure, label as cc_label

ROOT = Path(__file__).resolve().parents[1]
SYNTH_PATH = ROOT / "scripts/design/wood-grain-fourier-synthesis.py"
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
    hairline: bool = False
    centerline_thresh_frac: float = 0.12
    peak_mode: str = "local"  # local | column — local = more lines, column = one per x


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


def field_metrics(field: np.ndarray) -> dict[str, float | int]:
    """Quick mask stats so knob changes are visible in numbers."""
    cracks = np.clip(field, 0, 1)
    binary = (cracks > 0.12).astype(np.uint8)
    labeled, n = cc_label(binary, structure=generate_binary_structure(2, 2))
    aspects: list[float] = []
    widths: list[float] = []
    for i in range(1, n + 1):
        ys, xs = np.where(labeled == i)
        if len(xs) < 3:
            continue
        bw = int(xs.max() - xs.min() + 1)
        bh = int(ys.max() - ys.min() + 1)
        aspects.append(max(bw, bh) / (min(bw, bh) + 1e-8))
        widths.append(min(bw, bh))
    return {
        "coverage_pct": round(float(cracks.mean()) * 100, 2),
        "n_components": int(n),
        "width_median": round(float(np.median(widths)) if widths else 0.0, 1),
        "aspect_median": round(float(np.median(aspects)) if aspects else 0.0, 1),
    }


def _print_metrics(label: str, m: dict[str, float | int]) -> None:
    print(
        f"  {label}: cover={m['coverage_pct']}% #cc={m['n_components']} "
        f"width={m['width_median']}px aspect={m['aspect_median']}"
    )


KNOB_GUIDE = """
Micro hairline knobs (mostly independent):
  keep_p          AMOUNT   — lower = more ink (e.g. 66 dense, 78 sparse)
  centerline_thresh_frac  AMOUNT — lower = more peaks (e.g. 0.05 vs 0.10)
  close_x_frac    LENGTH   — bridges gaps along grain; does not add thickness
  peak_mode       AMOUNT   — local (many peaks) vs column (one y per x)
  pre_blur_x      DETECT   — how far crease detector looks along grain
  hairline=True   THICKNESS — 1px lines; False + stretch_blur_x = soft blobs

Why count dropped: blob mode smeared ink across pixels; hairline mode only keeps peaks.
Use keep + thresh to restore count without going back to stretched circles.

CLI: --micro-keep 66 --micro-close 0.28 --micro-thresh 0.05 --knob-report
"""


def grain_crease_micro_hairlines(
    base: np.ndarray,
    spec: LayerSpec,
    stretch_mul: float = 1.0,
) -> np.ndarray:
    """Hairline creases from local peaks — wanders in y, not horizontal Gaussian smear."""
    h, w = base.shape
    total_mul = stretch_mul * spec.layer_stretch_mul
    blur_x = spec.pre_blur_x * total_mul
    smooth = gaussian_filter(base, sigma=(spec.pre_blur_y, blur_x))
    grad_y = np.gradient(smooth, axis=0)
    dark = np.clip(-smooth, 0, None)
    crease = np.clip(-grad_y, 0, None)
    field = dark * spec.neg_weight + crease * spec.grad_weight
    field = _sparsify(field, spec.keep_p)

    peak = float(field.max())
    if peak <= 0:
        return field

    thresh = peak * spec.centerline_thresh_frac
    center = np.zeros_like(field)

    if spec.peak_mode == "column":
        for x in range(w):
            col = field[:, x]
            m = float(col.max())
            if m < thresh:
                continue
            ym = int(np.argmax(col))
            center[ym, x] = m
    else:
        # Local maxima — multiple y levels per column (more lines than column mode)
        nm = maximum_filter(field, size=(3, 3))
        peaks = (field >= nm - 1e-9) & (field >= thresh)
        center = np.where(peaks, field, 0.0)

    close_w = max(10, int(w * spec.close_x_frac * total_mul))
    center = grey_closing(center, size=(1, close_w))
    center = grey_opening(center, size=(1, max(3, int(w * spec.thin_frac))))

    peak = float(center.max())
    return center / (peak + 1e-8) if peak > 0 else center


def grain_crease_layer(base: np.ndarray, spec: LayerSpec, stretch_mul: float = 1.0) -> np.ndarray:
    """One depth layer with horizontal stretch to lengthen runs along grain."""
    if spec.hairline:
        return grain_crease_micro_hairlines(base, spec, stretch_mul)

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
    # Micro: 1px centerlines — NOT horizontal Gaussian smear (that was stretched circles)
    micro = LayerSpec(
        "micro",
        pre_blur_y=0.55,
        pre_blur_x=14.0,
        keep_p=66.0,
        neg_weight=0.10,
        grad_weight=1.4,
        close_x_frac=0.28,
        stretch_blur_x=0.0,
        thin_frac=0.010,
        post_thin_frac=0.0,
        layer_stretch_mul=1.35,
        hairline=True,
        centerline_thresh_frac=0.05,
        peak_mode="local",
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


def _apply_micro_cli(micro_spec: LayerSpec, args) -> LayerSpec:
    return LayerSpec(
        micro_spec.name,
        micro_spec.pre_blur_y,
        micro_spec.pre_blur_x,
        args.micro_keep if args.micro_keep is not None else micro_spec.keep_p,
        micro_spec.neg_weight,
        micro_spec.grad_weight,
        args.micro_close if args.micro_close is not None else micro_spec.close_x_frac,
        micro_spec.stretch_blur_x,
        micro_spec.thin_frac,
        micro_spec.post_thin_frac,
        micro_spec.layer_stretch_mul,
        hairline=micro_spec.hairline,
        centerline_thresh_frac=(
            args.micro_thresh if args.micro_thresh is not None else micro_spec.centerline_thresh_frac
        ),
        peak_mode=args.micro_peak_mode if args.micro_peak_mode else micro_spec.peak_mode,
    )


def _knob_isolation_report(base: np.ndarray, micro_template: LayerSpec, stretch: float) -> None:
    """Sweep one knob at a time — shows which dial moves count vs length."""
    print("\n--- KNOB ISOLATION (metrics only) ---")
    for keep in (62, 66, 70, 74, 78):
        spec = LayerSpec(
            micro_template.name,
            micro_template.pre_blur_y,
            micro_template.pre_blur_x,
            keep,
            micro_template.neg_weight,
            micro_template.grad_weight,
            micro_template.close_x_frac,
            micro_template.stretch_blur_x,
            micro_template.thin_frac,
            micro_template.post_thin_frac,
            micro_template.layer_stretch_mul,
            hairline=True,
            centerline_thresh_frac=micro_template.centerline_thresh_frac,
            peak_mode=micro_template.peak_mode,
        )
        m = field_metrics(grain_crease_layer(base, spec, stretch_mul=stretch))
        _print_metrics(f"keep_p={keep} (amount only)", m)

    for close in (0.18, 0.22, 0.26, 0.30, 0.34):
        spec = LayerSpec(
            micro_template.name,
            micro_template.pre_blur_y,
            micro_template.pre_blur_x,
            micro_template.keep_p,
            micro_template.neg_weight,
            micro_template.grad_weight,
            close,
            micro_template.stretch_blur_x,
            micro_template.thin_frac,
            micro_template.post_thin_frac,
            micro_template.layer_stretch_mul,
            hairline=True,
            centerline_thresh_frac=micro_template.centerline_thresh_frac,
            peak_mode=micro_template.peak_mode,
        )
        m = field_metrics(grain_crease_layer(base, spec, stretch_mul=stretch))
        _print_metrics(f"close_x={close:.2f} (length only)", m)


def main() -> None:
    import argparse

    parser = argparse.ArgumentParser(description="Grain crease 3-layer RGB + micro knobs")
    parser.add_argument("source", nargs="?", default=str(DEFAULT_SOURCE))
    parser.add_argument("out_dir", nargs="?", default=str(DEFAULT_OUT))
    parser.add_argument("--micro-keep", type=float, help="Amount: lower = more lines")
    parser.add_argument("--micro-close", type=float, help="Length: close_x_frac along grain")
    parser.add_argument("--micro-thresh", type=float, help="Amount: peak threshold fraction")
    parser.add_argument("--micro-peak-mode", choices=("local", "column"), default=None)
    parser.add_argument("--micro-stretch", type=float, default=1.5, help="Global stretch multiplier")
    parser.add_argument("--knob-report", action="store_true", help="Print isolated knob metrics table")
    args = parser.parse_args()

    source = Path(args.source)
    out_dir = Path(args.out_dir)
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
    micro_spec = _apply_micro_cli(micro_spec, args)

    if args.knob_report:
        print(KNOB_GUIDE)
        _knob_isolation_report(base, micro_spec, args.micro_stretch)

    print("\n--- CURRENT MICRO SETTINGS ---")
    print(
        f"  keep={micro_spec.keep_p} close={micro_spec.close_x_frac} "
        f"thresh={micro_spec.centerline_thresh_frac} peak={micro_spec.peak_mode} "
        f"stretch={args.micro_stretch}"
    )
    micro_preview = grain_crease_layer(base, micro_spec, stretch_mul=args.micro_stretch)
    _print_metrics("micro preview", field_metrics(micro_preview))
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

    micro_hero = grain_crease_layer(base, micro_spec, stretch_mul=args.micro_stretch)
    Image.fromarray(micro_only_rgb(micro_hero)).save(
        out_dir / "micro_only_stretch1p5.png"
    )
    Image.fromarray(micro_only_rgb(micro_hero)).save(
        ARTIFACTS / "crack_micro_blue_tuned.png"
    )

    # Micro density sweep (5 knobs on blue layer only)
    micro_sweep = [
        ("dense k70", 70.0, 1.35),
        ("★ hairline k72", 72.0, 1.35),
        ("k74", 74.0, 1.35),
        ("long close×1.55", 72.0, 1.55),
        ("long close×1.75", 72.0, 1.75),
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
            hairline=micro_spec.hairline,
            centerline_thresh_frac=micro_spec.centerline_thresh_frac,
            peak_mode=micro_spec.peak_mode,
        )
        field = grain_crease_layer(base, tuned, stretch_mul=args.micro_stretch)
        m = field_metrics(field)
        micro_panels.append((f"{label} #{m['n_components']}", Image.fromarray(micro_only_rgb(field))))
        _print_metrics(label, m)
    micro_montage = _montage_row(
        micro_panels, "L0 micro — 1px centerlines (wander y), not stretched blobs",
    )
    micro_montage.save(ARTIFACTS / "crack_micro_blue_sweep.png")

    print(f"\nOut: {out_dir}")
    print(f"RGB sweep: {ARTIFACTS / 'crack_layers_rgb_stretch_sweep.png'}")
    print(f"Micro tuned: {ARTIFACTS / 'crack_micro_blue_tuned.png'}")


if __name__ == "__main__":
    main()
