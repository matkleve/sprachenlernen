"""Sparse major fissures as continuous depth — not rectangle carving.

Big valleys come from the measured height field (ridge envelope − height). We keep
only the largest few connected components and composite with a capped depth cut so
grooves stay dark brown, never solid black bars.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np


@dataclass(frozen=True)
class SparseFissureIsolateParams:
    name: str
    keep_top: int = 2
    thresh_quantile: float = 0.98


SPARSE_ISOLATE_PRESETS: dict[str, SparseFissureIsolateParams] = {
    "major_2": SparseFissureIsolateParams(name="major_2", keep_top=2, thresh_quantile=0.98),
    "major_3": SparseFissureIsolateParams(name="major_3", keep_top=3, thresh_quantile=0.97),
    "major_2_deep": SparseFissureIsolateParams(name="major_2_deep", keep_top=2, thresh_quantile=0.985),
}


def _row_bands_from_coarse(norm: np.ndarray, row_peak_quantile: float, min_row_gap: int) -> list[tuple[int, int]]:
    h, w = norm.shape
    row_max = norm.max(axis=1)
    row_thr = float(np.quantile(row_max, row_peak_quantile))
    peak_rows = np.where(row_max >= row_thr)[0]
    if peak_rows.size == 0:
        return []
    bands: list[tuple[int, int]] = []
    start = int(peak_rows[0])
    prev = int(peak_rows[0])
    for r in peak_rows[1:]:
        r = int(r)
        if r - prev > min_row_gap:
            bands.append((start, prev))
            start = r
        prev = r
    bands.append((start, prev))
    return bands


def isolate_sparse_fissures(
    coarse_depth: np.ndarray,
    params: SparseFissureIsolateParams,
) -> tuple[np.ndarray, int]:
    """Keep major horizontal fissure *bands* with continuous measured depth."""
    peak = float(coarse_depth.max())
    if peak <= 0:
        return np.zeros_like(coarse_depth, dtype=np.float32), 0
    norm = coarse_depth / peak

    bands = _row_bands_from_coarse(norm, params.thresh_quantile, min_row_gap=24)
    bands = bands[: params.keep_top]
    if not bands:
        return np.zeros_like(coarse_depth, dtype=np.float32), 0

    out = np.zeros_like(norm, dtype=np.float32)
    depth_frac = 0.22 if params.name.endswith("_deep") else 0.18
    for y0, y1 in bands:
        region = norm[y0 : y1 + 1]
        band_peak = float(region.max())
        if band_peak <= 0:
            continue
        keep = region >= band_peak * depth_frac
        out[y0 : y1 + 1] = np.where(keep, region, 0.0)

    return out, len(bands)


def composite_valley_cut(
    grain_px: np.ndarray,
    valley_depth: np.ndarray,
    strength: float = 1.0,
    max_cut_fraction: float = 0.48,
) -> np.ndarray:
    """Height-map cut — continuous depth, capped so valleys never punch to #000."""
    cut = np.clip(valley_depth * 255.0 * strength * max_cut_fraction, 0, 255 * max_cut_fraction)
    return np.clip(128 + grain_px - cut, 0, 255)
