"""Valley depth from source luminance — threshold, not Gaussian.

Dark pixels in the photo ARE the valleys (height-field model). Ridge-envelope
subtraction narrows wide cracks; thresholding preserves their true width.
"""

from __future__ import annotations

import numpy as np
from scipy.ndimage import grey_closing, grey_opening


def luminance_valley_depth(
    height: np.ndarray,
    dark_quantile: float = 0.15,
) -> np.ndarray:
    """Depth = how far below a luminance threshold (sharp at threshold, deep in black).

    No blur — edges are exactly where the photo crosses the threshold.
    """
    peak = float(height.max())
    if peak <= 0:
        return np.zeros_like(height, dtype=np.float32)
    L = height / peak
    positives = L[L > 0]
    thr = float(np.quantile(positives, dark_quantile)) if positives.size else 0.2
    depth = np.clip(thr - L, 0.0, None) / (thr + 1e-8)
    return depth.astype(np.float32)


def split_threshold_valleys(
    height: np.ndarray,
    fine_quantile: float = 0.22,
    coarse_quantile: float = 0.10,
) -> tuple[np.ndarray, np.ndarray]:
    """Fine = all dark checking; coarse = only the deepest/widest dark (low quantile)."""
    fine = luminance_valley_depth(height, fine_quantile)
    coarse_full = luminance_valley_depth(height, coarse_quantile)
    coarse = np.clip(coarse_full - fine * 0.35, 0, None)
    peak = coarse.max()
    if peak > 0:
        coarse = coarse / peak
    return fine, coarse.astype(np.float32)


def morph_coarse_valleys(
    height: np.ndarray,
    dark_quantile: float = 0.12,
    min_width: int = 5,
) -> np.ndarray:
    """Threshold then keep horizontally elongated dark regions (wide cracks only)."""
    depth = luminance_valley_depth(height, dark_quantile)
    mask = depth > 0.25
    # horizontal closing bridges gaps along grain; opening removes thin vertical noise
    foot_h = np.ones((1, max(3, min_width | 1)), dtype=bool)
    foot_v = np.ones((3, 1), dtype=bool)
    m = grey_closing(mask.astype(np.uint8), structure=foot_h) > 0
    m = grey_opening(m.astype(np.uint8), structure=foot_v) > 0
    out = np.where(m, depth, 0.0).astype(np.float32)
    peak = out.max()
    return out / peak if peak > 0 else out
