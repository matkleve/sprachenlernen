#!/usr/bin/env python3
"""Export FFT pipeline layers + continuous sparse fissure variants (metrics-gated).

Usage:
    python3 scripts/wood-layer-explorer.py design/progression/patches/wood-01.png
"""

from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from lib.wood_sparse_valleys import (  # noqa: E402
    SPARSE_ISOLATE_PRESETS,
    composite_valley_cut,
    isolate_sparse_fissures,
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
        draw.text((x, y), label[:44], fill=(220, 220, 220))
    grid.save(out_path)


def finalize(layers: dict, shading: np.ndarray) -> np.ndarray:
    albedo = layers["albedo"]
    return np.clip(albedo * (shading[..., None] / 128.0), 0, 255)


def main(source: Path) -> None:
    synth = load_synth()
    name = source.stem
    out_layers = OUT_DESIGN / name
    out_layers.mkdir(parents=True, exist_ok=True)
    OUT_ARTIFACTS.mkdir(parents=True, exist_ok=True)

    layers = synth.build_layers(source)
    coarse_raw = layers["measured_coarse_valley_raw"]

    pipeline_layers = [
        ("01 height", layers["height"]),
        ("02 meas fine valley", layers["measured_fine_valley"]),
        ("03 meas coarse valley", layers["measured_coarse_valley"]),
        ("04 base grain", layers["base_grain"]),
        ("05 HB fine raw", layers["hb_fine_raw"]),
        ("06 HB coarse raw", layers["hb_coarse_raw"]),
        ("07 fine shaped", layers["fine_shaped"]),
        ("08 coarse shaped", layers["coarse_shaped"]),
        ("09 valley combined", layers["valley_combined"]),
        ("10 rim", layers["rim"]),
        ("11 rim patchy", layers["rim_patchy"]),
        ("12 shading", layers["shading"] / 255.0),
    ]
    exported: list[tuple[str, Path]] = []
    for label, arr in pipeline_layers:
        p = out_layers / f"{label[:2].strip()}_pipeline.png"
        save_gray01(p, arr)
        exported.append((label, p))
    save_rgb(out_layers / "13_final_rgb.png", layers["final_rgb"])
    exported.append(("13 final RGB", out_layers / "13_final_rgb.png"))
    make_grid(exported, OUT_ARTIFACTS / f"{name}-current-pipeline-layers.png", cols=4)

    metrics_rows: list[dict] = []
    sparse_depth_exports: list[tuple[str, Path]] = []
    sparse_final_exports: list[tuple[str, Path]] = []

    for preset_name, params in SPARSE_ISOLATE_PRESETS.items():
        depth, n_comp = isolate_sparse_fissures(coarse_raw, params)
        depth_path = out_layers / f"sparse_{preset_name}_depth.png"
        save_gray01(depth_path, depth)
        sparse_depth_exports.append((f"{preset_name} depth (n={n_comp})", depth_path))

        shading = composite_valley_cut(layers["grain_px"], depth, strength=1.0, max_cut_fraction=0.48)
        final = finalize(layers, shading)
        final_path = out_layers / f"sparse_{preset_name}_final.png"
        save_rgb(final_path, final)
        sparse_final_exports.append((preset_name, final_path))

        flags = run_metrics(source, final_path)
        metrics_rows.append(
            {
                "variant": preset_name,
                "components": n_comp,
                "depth_ink": round(float((depth > 0.05).mean()), 5),
                "contrast": flags.get("contrast", ""),
                "lightRange": flags.get("lightRange", ""),
                "tails": flags.get("tails", ""),
            }
        )

    flags_cur = run_metrics(source, out_layers / "13_final_rgb.png")
    metrics_rows.insert(
        0,
        {
            "variant": "current_fft_hb",
            "components": "—",
            "depth_ink": round(float(layers["coarse_shaped"].mean()), 5),
            "contrast": flags_cur.get("contrast", ""),
            "lightRange": flags_cur.get("lightRange", ""),
            "tails": flags_cur.get("tails", ""),
        },
    )

    metrics_path = OUT_ARTIFACTS / f"{name}-sparse-metrics.json"
    metrics_path.write_text(json.dumps(metrics_rows, indent=2), encoding="utf-8")

    make_grid(sparse_depth_exports, OUT_ARTIFACTS / f"{name}-sparse-depth-fields.png", cols=3)
    make_grid(sparse_final_exports, OUT_ARTIFACTS / f"{name}-sparse-finals.png", cols=3)

    src = Image.open(source).convert("RGB")
    meas = Image.open(out_layers / "03_pipeline.png").convert("RGB")
    best = Image.open(out_layers / "sparse_major_2_final.png")
    cur = Image.open(out_layers / "13_final_rgb.png")
    sw, sh = src.size
    stack = Image.new("RGB", (sw * 2 + 16, sh * 2 + 40), (20, 20, 20))
    draw = ImageDraw.Draw(stack)
    panels = [
        (src, "source"),
        (meas, "measured coarse (continuous)"),
        (best, "sparse major_2 + capped cut"),
        (cur, "current FFT+HB"),
    ]
    for i, (im, lab) in enumerate(panels):
        r, c = divmod(i, 2)
        x = 8 + c * (sw + 8)
        y = 24 + r * (sh + 16)
        stack.paste(im.resize((sw, sh)), (x, y))
        draw.text((x, y - 18), lab, fill=(230, 230, 230))
    stack.save(OUT_ARTIFACTS / f"{name}-continuous-sparse-compare.png")

    print(f"Metrics: {metrics_path}")
    for row in metrics_rows:
        print(f"  {row['variant']:16} comps={row['components']} ink={row['depth_ink']}  {row.get('contrast','')}")


if __name__ == "__main__":
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("design/progression/patches/wood-01.png")
    main(src)
