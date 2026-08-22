#!/usr/bin/env python3
"""2D FFT of a wood photo's crack layer (stage 2 of wood-grain-fourier-synthesis).

Outputs to a directory:
  - crack_layer.png          isolated defects: relu(blur(img) - img)
  - fft_magnitude_log.png    log-scaled |FFT| spectrum (DC centered)
  - fft_phase.png            phase angle visualization
  - remake_exact.png         inverse FFT — lossless reconstruction
  - remake_magnitude_only.png  |F| * exp(i*angle(F)) with original phase (same as exact)
  - remake_spectral.png      |F| smoothed * random phase (stochastic cousin)
  - comparison.png           side-by-side panel
"""

from __future__ import annotations

import sys
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

BLUR_SIGMA = 6.0
SPEC_SMOOTH_SIGMA = 2.5
SEED = 0


def load_gray(path: Path) -> np.ndarray:
    return np.asarray(Image.open(path).convert("L"), dtype=np.float64)


def crack_layer(img: np.ndarray, blur_sigma: float = BLUR_SIGMA) -> np.ndarray:
    base_tone = gaussian_filter(img, sigma=blur_sigma)
    return np.clip(base_tone - img, 0, None)


def hann_window(h: int, w: int) -> np.ndarray:
    return np.outer(np.hanning(h), np.hanning(w))


def to_uint8(arr: np.ndarray, vmin: float | None = None, vmax: float | None = None) -> np.ndarray:
    a = arr.astype(np.float64)
    lo = vmin if vmin is not None else a.min()
    hi = vmax if vmax is not None else a.max()
    if hi - lo < 1e-12:
        return np.zeros_like(a, dtype=np.uint8)
    return np.clip((a - lo) / (hi - lo) * 255, 0, 255).astype(np.uint8)


def analyze(input_path: Path, out_dir: Path, name: str) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    img = load_gray(input_path)
    h, w = img.shape
    rng = np.random.default_rng(SEED)

    cracks = crack_layer(img)
    cracks_c = cracks - cracks.mean()
    win = hann_window(h, w)

    # Lossless round-trip on the crack layer (no window)
    spec_lossless = np.fft.fft2(cracks_c)
    remake_lossless = np.fft.ifft2(spec_lossless).real + cracks.mean()
    remake_lossless = np.clip(remake_lossless, 0, None)

    # Windowed spectrum (matches wood-grain-fourier-synthesis.py stage 2)
    spec = np.fft.fft2(cracks_c * win)
    mag = np.abs(spec)
    phase = np.angle(spec)
    mag_shifted = np.fft.fftshift(mag)
    phase_shifted = np.fft.fftshift(phase)

    # Exact reconstruction of windowed signal (edges taper — expected)
    remake_exact = np.fft.ifft2(spec).real + cracks.mean()
    remake_exact = np.clip(remake_exact, 0, None)

    # Spectral cousin: smoothed magnitude, fresh random phase
    mag_smooth = gaussian_filter(mag_shifted, sigma=SPEC_SMOOTH_SIGMA)
    mag_smooth = np.fft.ifftshift(mag_smooth)
    mag_smooth[0, 0] = 0.0
    noise_phase = rng.uniform(-np.pi, np.pi, size=(h, w))
    spec_synth = mag_smooth * np.exp(1j * noise_phase)
    remake_spectral = np.fft.ifft2(spec_synth).real
    remake_spectral = np.clip(remake_spectral - remake_spectral.min(), 0, None)

    # Normalize spectral remake to crack layer dynamic range for visual compare
    if remake_spectral.max() > 0 and cracks.max() > 0:
        remake_spectral = remake_spectral / remake_spectral.max() * cracks.max()

    Image.fromarray(to_uint8(cracks), mode="L").save(out_dir / f"{name}_crack_layer.png")
    Image.fromarray(to_uint8(np.log1p(mag_shifted)), mode="L").save(out_dir / f"{name}_fft_magnitude_log.png")
    Image.fromarray(to_uint8(phase_shifted, vmin=-np.pi, vmax=np.pi), mode="L").save(
        out_dir / f"{name}_fft_phase.png"
    )
    Image.fromarray(to_uint8(remake_lossless), mode="L").save(out_dir / f"{name}_remake_lossless.png")
    Image.fromarray(to_uint8(remake_exact), mode="L").save(out_dir / f"{name}_remake_exact.png")
    Image.fromarray(to_uint8(remake_spectral), mode="L").save(out_dir / f"{name}_remake_spectral.png")

    # Comparison montage
    fig, axes = plt.subplots(2, 3, figsize=(14, 9))
    fig.suptitle(f"2D FFT crack layer — {name} ({w}×{h})", fontsize=14)

    panels = [
        (img, "Source (luminance)"),
        (cracks, "Crack layer  relu(blur−img)"),
        (np.log1p(mag_shifted), "log |FFT| (DC center)"),
        (remake_lossless, "IFFT lossless remake (507×507)"),
        (remake_spectral, "Spectral remake (|F| + random φ)"),
        (np.abs(remake_lossless - cracks), "|lossless − crack| (≈0)"),
    ]
    for ax, (data, title) in zip(axes.ravel(), panels):
        ax.imshow(data, cmap="gray", aspect="auto")
        ax.set_title(title, fontsize=10)
        ax.axis("off")

    plt.tight_layout()
    fig.savefig(out_dir / f"{name}_comparison.png", dpi=150, bbox_inches="tight")
    plt.close(fig)

    mse_lossless = float(np.mean((remake_lossless - cracks) ** 2))
    mse_windowed = float(np.mean((remake_exact - cracks) ** 2))
    print(f"[{name}] {w}×{h}  crack max={cracks.max():.1f}")
    print(f"  IFFT lossless MSE={mse_lossless:.2e}  windowed MSE={mse_windowed:.1f}")
    print(f"  -> {out_dir}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    src = Path(sys.argv[1])
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("/opt/cursor/artifacts/fft-crack")
    label = sys.argv[3] if len(sys.argv) > 3 else src.stem
    analyze(src, out, label)
