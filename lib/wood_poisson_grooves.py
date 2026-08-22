"""Poisson horizontal groove carving for wood height fields.

Marked Poisson line segments with plateau cross-section — sparse trenches
with flat floors and steep walls. See docs/study/STUDY-032-photographic-wood-grain-synthesis.md.
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
class PoissonGrooveParams:
    """One Poisson groove layer (fine checking or coarse fissures)."""

    name: str
    # expected segment count ≈ density_per_mpx2 * width * height
    density_per_mpx2: float
    length_min: int
    length_max: int
    depth_min: float
    depth_max: float
    w_flat: float
    w_wall: float
    seed: int = 0


def _sample_lengths(rng: np.random.Generator, n: int, p: PoissonGrooveParams) -> np.ndarray:
    lo, hi = p.length_min, max(p.length_min + 1, p.length_max)
    return rng.integers(lo, hi + 1, size=n)


def carve_poisson_grooves(
    height: int,
    width: int,
    params: PoissonGrooveParams,
    rng: np.random.Generator | None = None,
) -> np.ndarray:
    """Return normalized groove depth field in [0, 1] — continuous, not boolean."""
    if rng is None:
        rng = np.random.default_rng(params.seed)
    field = np.zeros((height, width), dtype=np.float64)
    n = int(rng.poisson(max(0.0, params.density_per_mpx2 * width * height)))
    n = max(n, 1) if params.density_per_mpx2 > 0 else 0

    for _ in range(n):
        y = int(rng.integers(0, height))
        length = int(_sample_lengths(rng, 1, params)[0])
        x0 = int(rng.integers(0, max(1, width - length)))
        depth = float(rng.uniform(params.depth_min, params.depth_max))
        y0 = max(0, y - int(np.ceil(params.w_wall / 2)))
        y1 = min(height, y + int(np.ceil(params.w_wall / 2)) + 1)
        x1 = min(width, x0 + length)
        yy = np.arange(y0, y1, dtype=np.float64)[:, None]
        dist = np.abs(yy - float(y))
        profile = plateau_profile(dist, params.w_flat, params.w_wall)
        cut = depth * profile
        field[y0:y1, x0:x1] = np.maximum(field[y0:y1, x0:x1], cut)

    peak = field.max()
    if peak > 0:
        field /= peak
    return field.astype(np.float32)


def measure_coarse_groove_params(
    coarse_depth: np.ndarray,
    quantile: float = 0.92,
) -> PoissonGrooveParams:
    """Fit Poisson groove params from measured coarse valley depth (photo)."""
    h, w = coarse_depth.shape
    peak = coarse_depth.max()
    if peak <= 0:
        return PoissonGrooveParams(
            name="photo_fit",
            density_per_mpx2=0.00008,
            length_min=40,
            length_max=180,
            depth_min=0.5,
            depth_max=1.0,
            w_flat=4,
            w_wall=10,
        )
    norm = coarse_depth / peak
    thr = float(np.quantile(norm[norm > 0], quantile)) if np.any(norm > 0) else 0.5
    mask = norm >= thr

    run_lengths: list[int] = []
    widths: list[int] = []
    depths: list[float] = []
    for y in range(h):
        row = mask[y]
        if not row.any():
            continue
        xs = np.where(row)[0]
        starts = [xs[0]]
        ends: list[int] = []
        for i in range(1, len(xs)):
            if xs[i] - xs[i - 1] > 1:
                ends.append(xs[i - 1])
                starts.append(xs[i])
        ends.append(xs[-1])
        for s, e in zip(starts, ends, strict=True):
            run_lengths.append(e - s + 1)
            depths.append(float(norm[y, s : e + 1].max()))
        # vertical extent at this row
        if row.any():
            widths.append(1)

    # vertical band width: rows with mask in same column runs
    col_active = mask.sum(axis=1)
    active_rows = np.where(col_active > w * 0.02)[0]
    band_est = max(3, int(np.median(np.diff(active_rows))) if len(active_rows) > 2 else 6)

    if not run_lengths:
        run_lengths = [80]
    if not depths:
        depths = [0.8]

    raw_density = len(run_lengths) / (w * h)
    density = float(np.clip(raw_density * 0.15, 0.00003, 0.00008))

    return PoissonGrooveParams(
        name="photo_fit",
        density_per_mpx2=density,
        length_min=max(12, int(np.percentile(run_lengths, 25))),
        length_max=max(24, int(np.percentile(run_lengths, 90))),
        depth_min=float(np.percentile(depths, 40)),
        depth_max=float(np.percentile(depths, 95)),
        w_flat=max(2.0, band_est * 0.6),
        w_wall=max(4.0, band_est * 1.8),
    )


# Named presets for layer explorer
POISSON_PRESETS: dict[str, PoissonGrooveParams] = {
    "sparse_coarse": PoissonGrooveParams(
        name="sparse_coarse",
        density_per_mpx2=0.00004,
        length_min=80,
        length_max=220,
        depth_min=0.55,
        depth_max=1.0,
        w_flat=5,
        w_wall=14,
        seed=10,
    ),
    "medium_coarse": PoissonGrooveParams(
        name="medium_coarse",
        density_per_mpx2=0.0001,
        length_min=50,
        length_max=160,
        depth_min=0.45,
        depth_max=0.95,
        w_flat=4,
        w_wall=11,
        seed=11,
    ),
    "heavy_fissure": PoissonGrooveParams(
        name="heavy_fissure",
        density_per_mpx2=0.00006,
        length_min=120,
        length_max=280,
        depth_min=0.7,
        depth_max=1.0,
        w_flat=7,
        w_wall=18,
        seed=12,
    ),
    "fine_checking": PoissonGrooveParams(
        name="fine_checking",
        density_per_mpx2=0.00035,
        length_min=18,
        length_max=70,
        depth_min=0.25,
        depth_max=0.65,
        w_flat=2,
        w_wall=5,
        seed=13,
    ),
    "fine_plus_coarse": PoissonGrooveParams(
        name="fine_plus_coarse_stub",
        density_per_mpx2=0.0,
        length_min=1,
        length_max=2,
        depth_min=0.0,
        depth_max=0.0,
        w_flat=1,
        w_wall=2,
    ),
}
