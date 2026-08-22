#!/usr/bin/env python3
"""Export FFT pipeline layers + sparse fissure variants with texture-metrics."""

from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from lib.wood_poisson_grooves import (  # noqa: E402
    SPARSE_PRESETS,
    carve_fissure_bands,
    extract_fissure_bands_from_photo,
    ink_fraction,
    sample_sparse_fissures,
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


def composite_fissures(
    layers: dict,
    coarse: np.ndarray,
    coarse_strength: float = 0.82,
) -> tuple[np.ndarray, np.ndarray]:
    grain_px = layers["grain_px"]
    valley_px = coarse * 255 * coarse_strength
    shading = np.clip(128 + grain_px - valley_px, 0, 255)
    albedo = layers["albedo"]
    final = np.clip(albedo * (shading[..., None] / 128.0), 0, 255)
    return shading, final


def run_metrics(reference: Path, candidate: Path) -> dict[str, str]:
    out = subprocess.run(
        ["node", "scripts/texture-metrics.mjs", str(reference), str(candidate)],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=True,
    )
    flags: dict[str, str] = {}
    for line in out.stdout.splitlines():
        if "<<" in line:
            key = line.strip().split()[0]
            flags[key] = line.strip()
    return flags


def make_grid(items: list[tuple[str, Path]], out_path: Path, cols: int = 4) -> None:
    cell = 256
    pad = 8
    label_h = 22
    rows = (len(items) + cols - 1) // cols
    grid = Image.new(
        "RGB",
        (cols * (cell + pad) + pad, rows * (cell + label_h + pad) + pad),
        (24, 24, 24),
    )
    draw = ImageDraw.Draw(grid)
    for i, (label, path) in enumerate(items):
        r, c = divmod(i, cols)
        x = pad + c * (cell + pad)
        y = pad + r * (cell + label_h + pad)
        im = Image.open(path).convert("RGB").resize((cell, cell), Image.Resampling.LANCZOS)
        grid.paste(im, (x, y + label_h))
        draw.text((x, y), label[:42], fill=(220, 220, 220))
    grid.save(out_path)


def main(source: Path) -> None:
    synth = load_synth()
    name = source.stem
    out_layers = OUT_DESIGN / name
    out_layers.mkdir(parents=True, exist_ok=True)
    OUT_ARTIFACTS.mkdir(parents=True, exist_ok=True)

    layers = synth.build_layers(source)
    h, w = layers["height"].shape

    layer_specs = [
        ("01 height", "height"),
        ("02 meas fine valley", "measured_fine_valley"),
        ("03 meas coarse valley", "measured_coarse_valley"),
        ("04 base grain", "base_grain"),
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
        else:
            save_gray01(p, layers[key])
        exported.append((label, p))
    save_rgb(out_layers / "13_final_rgb.png", layers["final_rgb"])
    exported.append(("13 final RGB", out_layers / "13_final_rgb.png"))
    make_grid(exported, OUT_ARTIFACTS / f"{name}-current-pipeline-layers.png", cols=4)

    photo_coarse = layers["measured_coarse_valley_raw"]
    photo_ink = ink_fraction(photo_coarse / (photo_coarse.max() + 1e-8), 0.15)
    extracted = extract_fissure_bands_from_photo(photo_coarse)
    extracted_depth = carve_fissure_bands(h, w, extracted)
    extracted_ink = ink_fraction(extracted_depth)

    fissure_jobs: list[tuple[str, np.ndarray, list]] = [
        ("photo_extracted", extracted_depth, extracted),
    ]
    metrics_rows: list[dict] = []

    for preset_name, params in SPARSE_PRESETS.items():
        bands, depth = sample_sparse_fissures(h, w, params, np.random.default_rng(params.seed))
        fissure_jobs.append((preset_name, depth, bands))

    for job_name, depth, bands in fissure_jobs:
        depth_path = out_layers / f"fissure_{job_name}_depth.png"
        save_gray01(depth_path, depth)
        shading, final = composite_fissures(layers, depth)
        final_path = out_layers / f"fissure_{job_name}_final.png"
        save_rgb(final_path, final)
        flags = run_metrics(source, final_path)
        metrics_rows.append(
            {
                "variant": job_name,
                "ink": round(ink_fraction(depth), 5),
                "n_bands": len(bands),
                "contrast": flags.get("contrast", ""),
                "lightRange": flags.get("lightRange", ""),
                "sortedL": flags.get("sortedL", ""),
            }
        )

    # current pipeline metrics for comparison
    cur_final = out_layers / "13_final_rgb.png"
    flags_cur = run_metrics(source, cur_final)
    metrics_rows.insert(
        0,
        {
            "variant": "current_fft_hb",
            "ink": round(float(layers["coarse_shaped"].mean()), 5),
            "n_bands": "—",
            "contrast": flags_cur.get("contrast", ""),
            "lightRange": flags_cur.get("lightRange", ""),
            "sortedL": flags_cur.get("sortedL", ""),
        },
    )
    metrics_rows.insert(
        0,
        {
            "variant": "source_photo",
            "ink": round(photo_ink, 5),
            "n_bands": len(extracted),
            "contrast": "—",
            "lightRange": "—",
            "sortedL": "—",
        },
    )

    metrics_path = OUT_ARTIFACTS / f"{name}-fissure-metrics.json"
    metrics_path.write_text(json.dumps(metrics_rows, indent=2), encoding="utf-8")

    # grid: only fissure finals (not scatter poisson)
    variant_items = [
        (row["variant"], out_layers / f"fissure_{row['variant']}_final.png")
        for row in metrics_rows
        if row["variant"] not in ("source_photo", "current_fft_hb")
    ]
    make_grid(variant_items, OUT_ARTIFACTS / f"{name}-sparse-fissure-variants.png", cols=3)

    # stack: source | photo_extracted | sparse_2
    src = Image.open(source).convert("RGB")
    best = Image.open(out_layers / "fissure_photo_extracted_final.png")
    s2 = Image.open(out_layers / "fissure_sparse_2_final.png")
    sw, sh = src.size
    stack = Image.new("RGB", (sw * 3 + 32, sh + 28), (20, 20, 20))
    draw = ImageDraw.Draw(stack)
    for i, (im, lab) in enumerate(
        [(src, "source"), (best, f"photo extracted ({len(extracted)} bands)"), (s2, "sparse_2")]
    ):
        stack.paste(im.resize((sw, sh)), (8 + i * (sw + 8), 24))
        draw.text((8 + i * (sw + 8), 4), lab, fill=(230, 230, 230))
    stack.save(OUT_ARTIFACTS / f"{name}-sparse-fissure-compare.png")

    # profile
    from lib.wood_poisson_grooves import plateau_profile

    r = np.linspace(0, 12, 200)
    prof = plateau_profile(r, w_flat=4, w_wall=12)
    fig, ax = plt.subplots(figsize=(6, 2.5))
    ax.plot(r, prof, color="#c4a574", linewidth=2)
    ax.set_title("Plateau fissure cross-section")
    ax.set_xlabel("px from groove center")
    fig.savefig(OUT_ARTIFACTS / f"{name}-plateau-profile.png", dpi=120, bbox_inches="tight")
    plt.close(fig)

    print(f"Photo coarse ink ~{photo_ink:.4f}, extracted bands={len(extracted)}, extracted ink={extracted_ink:.4f}")
    print(f"Metrics: {metrics_path}")
    for row in metrics_rows:
        print(f"  {row['variant']:18} ink={row['ink']} bands={row['n_bands']}  {row.get('contrast','')}")


if __name__ == "__main__":
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("design/progression/patches/wood-01.png")
    main(src)
