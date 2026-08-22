#!/usr/bin/env python3
"""Crack-layer and final-image metrics for wood FFT synthesis QA.

Complements scripts/texture-metrics.mjs (tone, aspect, runLength on finals).
This script measures the *crack mask* structure that texture-metrics cannot see:
component count, blob size, crack width, mask correlation to a reference.

Usage:
    # Crack masks — reference first, then candidates
    python3 scripts/wood-crack-metrics.py \\
        design/progression/rim-comparison/wood-01_extracted_crack_sparse.png \\
        design/progression/rim-comparison/wood-01_morph4_crack_morphological.png \\
        design/progression/rim-comparison/wood-01_procedural_crack_procedural.png

    # Finals vs source photo (add --source)
    python3 scripts/wood-crack-metrics.py --source design/progression/patches/wood-01.png \\
        design/progression/rim-comparison/wood-01_extracted_final.png \\
        design/progression/rim-comparison/wood-01_morph4_final.png

See docs/study/STUDY-031-texture-metrics.md (general texture) and
docs/study/STUDY-032-photographic-wood-grain-synthesis.md (FFT pipeline).
"""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import generate_binary_structure, label as cc_label

# White background, dark cracks — same convention as _crack_bw exports
CRACK_THRESH = 0.3
MIN_COMPONENT_PX = 5


def load_gray(path: Path) -> np.ndarray:
    return np.asarray(Image.open(path).convert("L"), dtype=np.float64) / 255.0


def cracks_from_mask(mask: np.ndarray) -> np.ndarray:
    return 1.0 - mask


def fft_horizontal_bias(cracks: np.ndarray) -> float:
    f = np.fft.fft2(cracks - cracks.mean())
    mag = np.abs(np.fft.fftshift(f))
    h, w = mag.shape
    cy, cx = h // 2, w // 2
    yy, xx = np.ogrid[:h, :w]
    dist_from_vertical = np.abs(xx - cx) / (cx + 1)
    dist_from_horizontal = np.abs(yy - cy) / (cy + 1)
    horiz_band = mag * (dist_from_vertical > 0.15)
    vert_band = mag * (dist_from_horizontal > 0.15)
    return float(horiz_band.sum() / (vert_band.sum() + 1e-8))


def component_stats(cracks: np.ndarray, thresh: float = CRACK_THRESH) -> dict[str, float | int]:
    binary = (cracks > thresh).astype(np.uint8)
    labeled, n = cc_label(binary, structure=generate_binary_structure(2, 2))
    aspects: list[float] = []
    widths: list[float] = []
    for i in range(1, n + 1):
        ys, xs = np.where(labeled == i)
        if len(xs) < MIN_COMPONENT_PX:
            continue
        bw = xs.max() - xs.min() + 1
        bh = ys.max() - ys.min() + 1
        aspects.append(max(bw, bh) / (min(bw, bh) + 1e-8))
        widths.append(min(bw, bh))
    blob_px = float(binary.sum()) / max(n, 1)
    return {
        "n_components": n,
        "avg_blob_px": blob_px,
        "aspect_median": float(np.median(aspects)) if aspects else 0.0,
        "width_median_px": float(np.median(widths)) if widths else 0.0,
    }


def hist_tail(cracks: np.ndarray) -> float:
    pos = cracks[cracks > 0.01]
    if pos.size == 0:
        return 0.0
    thresh = np.percentile(pos, 95)
    return float(cracks[cracks >= thresh].sum() / (cracks.sum() + 1e-8))


def measure_crack_mask(path: Path) -> dict[str, float | int | str]:
    cracks = cracks_from_mask(load_gray(path))
    cs = component_stats(cracks)
    return {
        "path": str(path),
        "coverage_pct": round(float(cracks.mean()) * 100, 2),
        "mean_intensity": round(float(cracks.mean()), 4),
        "fft_h_over_v": round(fft_horizontal_bias(cracks), 2),
        "tail_top5_pct": round(hist_tail(cracks), 3),
        **{k: (round(v, 2) if isinstance(v, float) else v) for k, v in cs.items()},
    }


def measure_final(path: Path, source: np.ndarray) -> dict[str, float | str]:
    final = np.asarray(Image.open(path).convert("L"), dtype=np.float64)
    diff = final - source
    mse = float(np.mean(diff ** 2))
    corr = float(np.corrcoef(final.ravel(), source.ravel())[0, 1])
    return {"path": str(path), "mse_vs_source": round(mse, 1), "corr_vs_source": round(corr, 4)}


def mask_distance(ref: dict, cand: dict) -> float:
    d_cov = abs(cand["coverage_pct"] - ref["coverage_pct"]) / 100
    d_n = abs(np.log(cand["n_components"] + 1) - np.log(ref["n_components"] + 1))
    d_blob = abs(cand["avg_blob_px"] - ref["avg_blob_px"]) / max(ref["avg_blob_px"], 1)
    d_width = abs(cand["width_median_px"] - ref["width_median_px"]) / max(ref["width_median_px"], 1)
    d_aspect = abs(cand["aspect_median"] - ref["aspect_median"])
    d_fft = abs(cand["fft_h_over_v"] - ref["fft_h_over_v"])
    d_tail = abs(cand["tail_top5_pct"] - ref["tail_top5_pct"])
    return float(d_cov + d_n + d_blob + d_width + d_aspect + d_fft + d_tail)


def mask_corr(ref_cracks: np.ndarray, cand_cracks: np.ndarray) -> float:
    return float(np.corrcoef(ref_cracks.ravel(), cand_cracks.ravel())[0, 1])


def print_crack_table(rows: list[dict], ref: dict | None) -> None:
    cols = [
        ("cover%", "coverage_pct", "{:>6.2f}"),
        ("#cc", "n_components", "{:>5d}"),
        ("blob", "avg_blob_px", "{:>5.0f}"),
        ("aspect", "aspect_median", "{:>5.1f}"),
        ("width", "width_median_px", "{:>5.1f}"),
        ("fft", "fft_h_over_v", "{:>5.2f}"),
        ("tail5", "tail_top5_pct", "{:>5.3f}"),
    ]
    if ref is not None:
        cols.append(("dist", "_dist", "{:>6.2f}"))

    header = f"{'file':<44} " + " ".join(f"{name:>6}" for name, _, _ in cols)
    print(header)
    print("-" * len(header))
    for row in rows:
        label = Path(row["path"]).name
        if len(label) > 44:
            label = label[:41] + "..."
        parts = [f"{label:<44}"]
        for _, key, fmt in cols:
            val = row.get(key, 0)
            parts.append(fmt.format(val))
        print(" ".join(parts))


def main() -> None:
    parser = argparse.ArgumentParser(description="Crack mask + final image metrics for wood synthesis QA")
    parser.add_argument("images", nargs="+", type=Path, help="Reference first, then candidates")
    parser.add_argument(
        "--source",
        type=Path,
        help="Source photo for MSE/correlation on final images (must be *_final.png inputs)",
    )
    parser.add_argument(
        "--crack-mode",
        action="store_true",
        help="Force crack-mask mode even if paths look like finals",
    )
    args = parser.parse_args()

    paths = args.images
    if not paths:
        parser.error("at least one image required")

    is_final_mode = args.source is not None and not args.crack_mode
    if not is_final_mode and not args.crack_mode:
        is_final_mode = all("final" in p.name for p in paths)

    if is_final_mode:
        if args.source is None:
            parser.error("--source required for final-image comparison")
        source = np.asarray(Image.open(args.source).convert("L"), dtype=np.float64)
        print(f"FINAL vs SOURCE  {args.source}")
        ref_row = measure_final(paths[0], source)
        print(f"  reference  {ref_row['path']}")
        print(f"    MSE={ref_row['mse_vs_source']}  corr={ref_row['corr_vs_source']}")
        for path in paths[1:]:
            row = measure_final(path, source)
            print(f"  candidate  {row['path']}")
            print(f"    MSE={row['mse_vs_source']}  corr={row['corr_vs_source']}")
        print("\nAlso run: node scripts/texture-metrics.mjs <source> <finals...>")
        return

    print("CRACK MASK METRICS  (reference = first image)")
    ref_path = paths[0]
    ref_cracks = cracks_from_mask(load_gray(ref_path))
    ref_row = measure_crack_mask(ref_path)
    ref_row["_dist"] = 0.0
    rows = [ref_row]

    for path in paths[1:]:
        row = measure_crack_mask(path)
        row["_dist"] = round(mask_distance(ref_row, row), 3)
        corr = mask_corr(ref_cracks, cracks_from_mask(load_gray(path)))
        row["_mask_corr"] = round(corr, 4)
        rows.append(row)

    print_crack_table(rows, ref_row)

    if len(rows) > 1:
        print("\nMask correlation to reference:")
        for row in rows[1:]:
            print(f"  {Path(row['path']).name}: corr={row.get('_mask_corr', 0):.4f}")

    print("\nTarget structure (real cracks): many components, ~2px width, aspect ~6, small blobs.")
    print("General texture: node scripts/texture-metrics.mjs <source.png> <final.png>")


if __name__ == "__main__":
    main()
