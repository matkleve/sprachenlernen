#!/usr/bin/env python3
"""Side-by-side montage: source patch vs FFT-synthesized final tile."""

from __future__ import annotations

import sys
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from PIL import Image

PATCH_DIR = Path("design/progression/patches")
SYNTH_DIR = Path("design/progression/synthesized")
OUT_DIR = Path("/opt/cursor/artifacts/wood-synthesis-compare")


def load_rgb(path: Path) -> np.ndarray:
    return np.asarray(Image.open(path).convert("RGB"))


def tone_stats(a: np.ndarray) -> tuple[float, float]:
    gray = a.mean(axis=-1) if a.ndim == 3 else a
    return float(np.median(gray)), float(gray.std())


def main(out_dir: Path) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    ids = [f"wood-{i:02d}" for i in range(1, 7)]

    # Per-species rows: source | remake
    fig, axes = plt.subplots(6, 2, figsize=(10, 24))
    fig.suptitle("Source photo vs FFT-synthesized remake (507×507 each)", fontsize=14, y=0.995)

    stats_lines: list[str] = []
    for row, wid in enumerate(ids):
        src = load_rgb(PATCH_DIR / f"{wid}.png")
        syn = load_rgb(SYNTH_DIR / f"{wid}_final.png")
        med_s, std_s = tone_stats(src)
        med_y, std_y = tone_stats(syn)

        axes[row, 0].imshow(src)
        axes[row, 0].set_title(f"{wid} — source", fontsize=10)
        axes[row, 1].imshow(syn)
        axes[row, 1].set_title(f"{wid} — synthesized", fontsize=10)
        for col in range(2):
            axes[row, col].axis("off")

        # Simple luminance diff (not perceptual — diagnostic only)
        diff = np.abs(src.astype(float) - syn.astype(float)).mean()
        stats_lines.append(f"{wid}: median L {med_s:.0f}→{med_y:.0f}, σ {std_s:.1f}→{std_y:.1f}, mean |ΔRGB|={diff:.1f}")

    plt.tight_layout()
    rows_path = out_dir / "source_vs_synthesis_rows.png"
    fig.savefig(rows_path, dpi=120, bbox_inches="tight")
    plt.close(fig)

    # Compact grid: top row sources, bottom row remakes
    fig, axes = plt.subplots(2, 6, figsize=(18, 6.5))
    fig.suptitle("Top: source patches  ·  Bottom: FFT recipe remakes", fontsize=13)
    for col, wid in enumerate(ids):
        axes[0, col].imshow(load_rgb(PATCH_DIR / f"{wid}.png"))
        axes[0, col].set_title(wid, fontsize=9)
        axes[1, col].imshow(load_rgb(SYNTH_DIR / f"{wid}_final.png"))
        for row in range(2):
            axes[row, col].axis("off")
    plt.tight_layout()
    grid_path = out_dir / "source_vs_synthesis_grid.png"
    fig.savefig(grid_path, dpi=120, bbox_inches="tight")
    plt.close(fig)

    stats_path = out_dir / "stats.txt"
    stats_path.write_text("\n".join(stats_lines) + "\n")

    print("\n".join(stats_lines))
    print(f"\nWrote {rows_path}")
    print(f"Wrote {grid_path}")


if __name__ == "__main__":
    main(Path(sys.argv[1]) if len(sys.argv) > 1 else OUT_DIR)
