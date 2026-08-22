"""Sparse horizontal fissure carving for wood height fields.

Big valleys are few long bands — not scattered Poisson segments. Parameters
are fit from measured coarse valley depth on the source photo; ink budget is
checked against photo stats before export.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np


def smoothstep(t: np.ndarray) -> np.ndarray:
    t = np.clip(t, 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def plateau_profile(r: np.ndarray, w_flat: float, w_wall: float) -> np.ndarray:
    """Flat floor inside |r| <= w_flat/2, smooth wall to zero at w_wall/2."""
    r = np.abs(r).astype(np.float64)
    w_flat = max(1.0, float(w_flat))
    w_wall = max(w_flat + 1.0, float(w_wall))
    half_flat = w_flat * 0.5
    half_wall = w_wall * 0.5
    out = np.zeros_like(r)
    inside = r <= half_flat
    out[inside] = 1.0
    wall = (r > half_flat) & (r <= half_wall)
    if np.any(wall):
        t = (r[wall] - half_flat) / (half_wall - half_flat + 1e-8)
        out[wall] = 1.0 - smoothstep(t)
    return out


@dataclass(frozen=True)
class FissureBand:
  y: int
  x0: int
  x1: int
  depth: float
  w_flat: float
  w_wall: float


@dataclass(frozen=True)
class SparseFissureParams:
    name: str
    n_bands_min: int
    n_bands_max: int
    min_row_sep: int
    length_frac_min: float
    length_frac_max: float
    depth_min: float
    depth_max: float
    w_flat: float
    w_wall: float
    seed: int = 0


def _carve_band(field: np.ndarray, band: FissureBand) -> None:
    h, w = field.shape
    y = int(np.clip(band.y, 0, h - 1))
    x0 = int(np.clip(min(band.x0, band.x1), 0, w - 1))
    x1 = int(np.clip(max(band.x0, band.x1), 0, w - 1))
    if x1 <= x0:
        return
    y0 = max(0, y - int(np.ceil(band.w_wall / 2)))
    y1 = min(h, y + int(np.ceil(band.w_wall / 2)) + 1)
    yy = np.arange(y0, y1, dtype=np.float64)[:, None]
    dist = np.abs(yy - float(y))
    profile = plateau_profile(dist, band.w_flat, band.w_wall)
    cut = band.depth * profile
    field[y0:y1, x0 : x1 + 1] = np.maximum(field[y0:y1, x0 : x1 + 1], cut)


def carve_fissure_bands(height: int, width: int, bands: list[FissureBand]) -> np.ndarray:
    """Continuous depth field [0, 1] from explicit horizontal fissure bands."""
    field = np.zeros((height, width), dtype=np.float64)
    for band in bands:
        _carve_band(field, band)
    peak = field.max()
    if peak > 0:
        field /= peak
    return field.astype(np.float32)


def _pick_row_centers(
    height: int,
    count: int,
    min_sep: int,
    rng: np.random.Generator,
) -> list[int]:
    """Place `count` horizontal bands with minimum vertical separation."""
    if count <= 0:
        return []
    margin = max(8, int(min_sep // 2))
    lo, hi = margin, height - margin
    if hi <= lo:
        return [height // 2] * count
    min_sep = max(8, int(min_sep))
    for _ in range(200):
        ys = sorted(int(rng.integers(lo, hi)) for _ in range(count))
        ok = all(b - a >= min_sep for a, b in zip(ys, ys[1:], strict=False))
        if ok or count == 1:
            return ys
    # fallback: evenly spaced
    step = max(min_sep, (hi - lo) // max(1, count))
    return [min(hi, lo + i * step) for i in range(count)]


def sample_sparse_fissures(
    height: int,
    width: int,
    params: SparseFissureParams,
    rng: np.random.Generator | None = None,
) -> tuple[list[FissureBand], np.ndarray]:
    if rng is None:
        rng = np.random.default_rng(params.seed)
    n = int(rng.integers(params.n_bands_min, params.n_bands_max + 1))
    rows = _pick_row_centers(height, n, params.min_row_sep, rng)
    bands: list[FissureBand] = []
    for y in rows:
        frac = float(rng.uniform(params.length_frac_min, params.length_frac_max))
        length = max(24, int(frac * width))
        x0 = int(rng.integers(0, max(1, width - length)))
        depth = float(rng.uniform(params.depth_min, params.depth_max))
        bands.append(
            FissureBand(
                y=y,
                x0=x0,
                x1=x0 + length,
                depth=depth,
                w_flat=params.w_flat,
                w_wall=params.w_wall,
            )
        )
    field = carve_fissure_bands(height, width, bands)
    return bands, field


def extract_fissure_bands_from_photo(
    coarse_depth: np.ndarray,
    row_peak_quantile: float = 0.98,
    run_depth_quantile: float = 0.99,
    min_row_gap: int = 20,
) -> list[FissureBand]:
    """Pull the few major horizontal fissures from measured coarse valley depth."""
    h, w = coarse_depth.shape
    peak = coarse_depth.max()
    if peak <= 0:
        return []
    norm = coarse_depth / peak
    positives = norm[norm > 0]
    if positives.size == 0:
        return []

    row_max = norm.max(axis=1)
    row_thr = float(np.quantile(row_max, row_peak_quantile))
    peak_rows = np.where(row_max >= row_thr)[0]
    if peak_rows.size == 0:
        return []

    bands_rows: list[tuple[int, int]] = []
    start = int(peak_rows[0])
    prev = int(peak_rows[0])
    for r in peak_rows[1:]:
        r = int(r)
        if r - prev > min_row_gap:
            bands_rows.append((start, prev))
            start = r
        prev = r
    bands_rows.append((start, prev))

    out: list[FissureBand] = []
    for y0, y1 in bands_rows:
        y = (y0 + y1) // 2
        region = norm[y0 : y1 + 1]
        band_peak = float(region.max())
        if band_peak <= 0:
            continue
        # Full horizontal extent of this fissure band — not only the deepest pixels
        band_mask = region >= band_peak * 0.35
        cols = np.where(band_mask.any(axis=0))[0]
        if cols.size == 0:
            continue
        x0, x1 = int(cols[0]), int(cols[-1])
        band_h = max(3, y1 - y0 + 1)
        depth = band_peak
        out.append(
            FissureBand(
                y=y,
                x0=x0,
                x1=x1,
                depth=depth,
                w_flat=max(2.0, band_h * 0.8),
                w_wall=max(5.0, band_h * 2.0),
            )
        )
    return out


def ink_fraction(depth: np.ndarray, threshold: float = 0.08) -> float:
    return float((depth >= threshold).mean())


# Calibrated: wood-01 photo has ~2 major bands, ~0.8–2% ink at coarse scale
SPARSE_PRESETS: dict[str, SparseFissureParams] = {
    "photo_2band": SparseFissureParams(
        name="photo_2band",
        n_bands_min=2,
        n_bands_max=2,
        min_row_sep=80,
        length_frac_min=0.45,
        length_frac_max=0.85,
        depth_min=0.75,
        depth_max=1.0,
        w_flat=4,
        w_wall=12,
        seed=20,
    ),
    "sparse_2": SparseFissureParams(
        name="sparse_2",
        n_bands_min=2,
        n_bands_max=2,
        min_row_sep=100,
        length_frac_min=0.35,
        length_frac_max=0.75,
        depth_min=0.6,
        depth_max=0.95,
        w_flat=3,
        w_wall=10,
        seed=21,
    ),
    "sparse_3": SparseFissureParams(
        name="sparse_3",
        n_bands_min=3,
        n_bands_max=3,
        min_row_sep=70,
        length_frac_min=0.25,
        length_frac_max=0.65,
        depth_min=0.5,
        depth_max=0.9,
        w_flat=3,
        w_wall=9,
        seed=22,
    ),
    "sparse_4": SparseFissureParams(
        name="sparse_4",
        n_bands_min=4,
        n_bands_max=4,
        min_row_sep=55,
        length_frac_min=0.2,
        length_frac_max=0.55,
        depth_min=0.45,
        depth_max=0.85,
        w_flat=2,
        w_wall=8,
        seed=23,
    ),
}
