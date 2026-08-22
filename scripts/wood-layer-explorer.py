#!/usr/bin/env python3
"""Export every FFT wood-synthesis layer + Poisson groove variants for one patch.

Usage:
    python3 scripts/wood-layer-explorer.py design/progression/patches/wood-01.png
"""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from lib.wood_poisson_grooves import (  # noqa: E402
    POISSON_PRESETS,
    PoissonGrooveParams,
    carve_poisson_grooves,
    measure_coarse_groove_params,
)

SYNTH_PATH = ROOT / "scripts" / "wood-grain-fourier-synthesis.py"
OUT_ARTIFACTS = Path("/opt/cursor/artifacts/wood-layers")
OUT_DESIGN = ROOT / "design" / "progression" / "layer-explorer"


def load_synth():
    spec = importlib.util.spec_from_file_location("wood_synth", SYNTH_PATH)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def save_gray01(path: Path, arr: np.ndarray) -> None:
    a = np.clip(arr, 0, 1)
    if a.max() > 1.01:
        a = a / 255.0
    Image.fromarray((a * 255).astype(np.uint8), mode="L").save(path)


def save_rgb(path: Path, arr: np.ndarray) -> None:
    Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), mode="RGB").save(path)


def composite_poisson(
    layers: dict,
    coarse: np.ndarray,
    fine: np.ndarray | None,
    coarse_strength: float = 0.72,
    fine_strength: float = 0.45,
) -> tuple[np.ndarray, np.ndarray]:
    """Base grain + Poisson grooves → shading + RGB final."""
    grain_px = layers["grain_px"]
    valley_px = coarse * 255 * coarse_strength
    if fine is not None:
        valley_px = valley_px + fine * 255 * fine_strength
    shading = np.clip(128 + grain_px - valley_px, 0, 255)
    albedo = layers["albedo"]
    final = np.clip(albedo * (shading[..., None] / 128.0), 0, 255)
    return shading, final


def make_layer_grid(layer_paths: list[tuple[str, Path]], out_path: Path, cols: int = 4) -> None:
    n = len(layer_paths)
    rows = (n + cols - 1) // cols
    cell = 256
    pad = 8
    label_h = 22
    grid = Image.new("RGB", (cols * (cell + pad) + pad, rows * (cell + label_h + pad) + pad), (24, 24, 24))
    draw = ImageDraw.Draw(grid)
    for i, (label, path) in enumerate(layer_paths):
        r, c = divmod(i, cols)
        x = pad + c * (cell + pad)
        y = pad + r * (cell + label_h + pad)
        im = Image.open(path).convert("RGB")
        im = im.resize((cell, cell), Image.Resampling.LANCZOS)
        grid.paste(im, (x, y + label_h))
        draw.text((x, y), label, fill=(220, 220, 220))
    grid.save(out_path)


def make_poisson_grid(variants: list[tuple[str, Path]], out_path: Path, cols: int = 3) -> None:
    make_layer_grid(variants, out_path, cols=cols)


def main(source: Path) -> None:
    synth = load_synth()
    name = source.stem
    out_layers = OUT_DESIGN / name
    out_layers.mkdir(parents=True, exist_ok=True)
    OUT_ARTIFACTS.mkdir(parents=True, exist_ok=True)

    layers = synth.build_layers(source)
    h, w = layers["height"].shape

    # --- current pipeline layers ---
    layer_specs = [
        ("01 height (source L)", "height"),
        ("02 measured fine valley", "measured_fine_valley"),
        ("03 measured coarse valley", "measured_coarse_valley"),
        ("04 base grain (FFT)", "base_grain"),
        ("05 HB fine raw", "hb_fine_raw"),
        ("06 HB coarse raw", "hb_coarse_raw"),
        ("07 fine shaped", "fine_shaped"),
        ("08 coarse shaped", "coarse_shaped"),
        ("09 valley combined", "valley_combined"),
        ("10 rim", "rim"),
        ("11 rim patchy", "rim_patchy"),
        ("12 shading", "shading"),
    ]
    exported: list[tuple[str, Path]] = []
    for label, key in layer_specs:
        p = out_layers / f"{key}.png"
        if key == "shading":
            save_gray01(p, layers[key] / 255.0)
        elif key in ("rim", "rim_patchy", "fine_shaped", "coarse_shaped", "valley_combined", "hb_fine_raw", "hb_coarse_raw"):
            save_gray01(p, layers[key])
        else:
            save_gray01(p, layers[key])
        exported.append((label, p))

    save_rgb(out_layers / "13_final_rgb.png", layers["final_rgb"])
    exported.append(("13 final RGB", out_layers / "13_final_rgb.png"))

    current_grid = OUT_ARTIFACTS / f"{name}-current-pipeline-layers.png"
    make_layer_grid(exported, current_grid, cols=4)

    # --- Poisson groove presets ---
    measured_coarse = layers["measured_coarse_valley_raw"]
    photo_fit = measure_coarse_groove_params(measured_coarse)

    fine_preset = POISSON_PRESETS["fine_checking"]
    poisson_jobs: list[tuple[str, PoissonGrooveParams, PoissonGrooveParams | None]] = [
        ("poisson_sparse_coarse", POISSON_PRESETS["sparse_coarse"], None),
        ("poisson_medium_coarse", POISSON_PRESETS["medium_coarse"], None),
        ("poisson_heavy_fissure", POISSON_PRESETS["heavy_fissure"], None),
        ("poisson_photo_fit", photo_fit, None),
        (
            "poisson_fine_plus_coarse",
            POISSON_PRESETS["sparse_coarse"],
            fine_preset,
        ),
    ]

    poisson_exported: list[tuple[str, Path]] = []
    depth_exported: list[tuple[str, Path]] = []

    for job_name, coarse_p, fine_p in poisson_jobs:
        rng_c = np.random.default_rng(coarse_p.seed)
        coarse_depth = carve_poisson_grooves(h, w, coarse_p, rng_c)
        fine_depth = None
        if fine_p is not None:
            fine_depth = carve_poisson_grooves(h, w, fine_p, np.random.default_rng(fine_p.seed))

        depth_path = out_layers / f"{job_name}_depth.png"
        save_gray01(depth_path, coarse_depth if fine_depth is None else np.clip(coarse_depth + fine_depth * 0.5, 0, 1))
        depth_exported.append((job_name.replace("_", " "), depth_path))

        shading, final = composite_poisson(layers, coarse_depth, fine_depth)
        shade_path = out_layers / f"{job_name}_shading.png"
        final_path = out_layers / f"{job_name}_final.png"
        save_gray01(shade_path, shading / 255.0)
        save_rgb(final_path, final)
        poisson_exported.append((job_name.replace("_", " "), final_path))

    # profile cross-section demo (plateau shape)
    from lib.wood_poisson_grooves import plateau_profile

    r = np.linspace(0, 12, 200)
    prof = plateau_profile(r, w_flat=4, w_wall=12)
    fig, ax = plt.subplots(figsize=(6, 2.5))
    ax.plot(r, prof, color="#c4a574", linewidth=2)
    ax.set_title("Plateau groove profile φ(r) — flat floor, steep wall")
    ax.set_xlabel("distance from groove center (px)")
    ax.set_ylabel("depth")
    ax.grid(True, alpha=0.3)
    profile_path = OUT_ARTIFACTS / f"{name}-plateau-profile.png"
    fig.savefig(profile_path, dpi=120, bbox_inches="tight")
    plt.close(fig)

    poisson_grid = OUT_ARTIFACTS / f"{name}-poisson-variants.png"
    make_poisson_grid(poisson_exported, poisson_grid, cols=3)

    depth_grid = OUT_ARTIFACTS / f"{name}-poisson-depth-fields.png"
    make_poisson_grid(depth_exported, depth_grid, cols=3)

    # stacked: source | current final | best poisson candidate
    src = Image.open(source).convert("RGB")
    cur = Image.open(out_layers / "13_final_rgb.png")
    pois = Image.open(out_layers / "poisson_photo_fit_final.png")
    sw, sh = src.size
    stack = Image.new("RGB", (sw * 3 + 32, sh + 28), (20, 20, 20))
    draw = ImageDraw.Draw(stack)
    for i, (im, lab) in enumerate([(src, "source"), (cur, "current FFT+HB"), (pois, "Poisson photo_fit")]):
        stack.paste(im.resize((sw, sh)), (8 + i * (sw + 8), 24))
        draw.text((8 + i * (sw + 8), 4), lab, fill=(230, 230, 230))
    stack_path = OUT_ARTIFACTS / f"{name}-source-current-poisson.png"
    stack.save(stack_path)

    print(f"Layers written to {out_layers}")
    print(f"Montages written to {OUT_ARTIFACTS}")
    for p in [current_grid, poisson_grid, depth_grid, stack_path, profile_path]:
        print(f"  {p}")


if __name__ == "__main__":
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("design/progression/patches/wood-01.png")
    main(src)
