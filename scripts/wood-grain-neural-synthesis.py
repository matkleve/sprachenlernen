#!/usr/bin/env python3
"""Fully generative neural wood texture synthesis — no hybrid valley stamping.

Unlike wood-grain-fourier-synthesis.py (which measures crack positions from the
source photo), this script generates a NEW tile from learned statistics only.

Modes
-----
gatys  Grayscale hills/valleys via VGG Gram matching, then albedo × shading / 128
       for colour (same separation as the FFT pipeline). Structure is generated;
       colour is low-frequency wood tone from the reference — not crack positions.
       Pass --rgb for legacy full-colour Gatys (often hue-drifts).
vae    Train a small conv VAE on augmented crops, sample from the latent prior.

Dependencies (not in main package.json — install once):
    pip install -r scripts/requirements-neural-wood.txt \\
        --index-url https://download.pytorch.org/whl/cpu

Usage:
    python3 scripts/wood-grain-neural-synthesis.py \\
        design/progression/patches/wood-01.png wood-01 gatys

    python3 scripts/wood-grain-neural-synthesis.py \\
        design/progression/patches/wood-01.png wood-01 vae \\
        --epochs 60 --steps 300

Outputs land in design/progression/synthesized/ by default.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[1]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))


def _check_torch() -> None:
    try:
        import torch  # noqa: F401
    except ImportError:
        print(
            "PyTorch is required for neural synthesis.\n"
            "  pip install -r scripts/requirements-neural-wood.txt "
            "--index-url https://download.pytorch.org/whl/cpu",
            file=sys.stderr,
        )
        sys.exit(1)


def main() -> None:
    _check_torch()
    from lib.wood_neural_synthesis import (
        GatysConfig,
        VAEConfig,
        synthesize_gatys,
        synthesize_gatys_shading,
        synthesize_vae,
    )
    from PIL import Image
    import numpy as np

    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("source", type=Path, help="Reference wood photo (statistics only — not stamped)")
    parser.add_argument("name", type=str, help="Output basename prefix, e.g. wood-01")
    parser.add_argument(
        "mode",
        choices=["gatys", "vae"],
        help="gatys = VGG relief + albedo colorize; vae = latent generator",
    )
    parser.add_argument("--out-dir", type=Path, default=Path("design/progression/synthesized"))
    parser.add_argument("--width", type=int, default=0, help="Output width (default: same as source)")
    parser.add_argument("--height", type=int, default=0, help="Output height (default: same as source)")
    parser.add_argument("--steps", type=int, default=400, help="Gatys optimization steps")
    parser.add_argument("--epochs", type=int, default=80, help="VAE training epochs")
    parser.add_argument("--seed", type=int, default=0)
    parser.add_argument(
        "--rgb",
        action="store_true",
        help="Gatys: optimize full RGB (legacy — colours often drift)",
    )
    parser.add_argument(
        "--albedo-sigma",
        type=float,
        default=14.0,
        help="Gaussian blur sigma for reference albedo (default 14)",
    )
    args = parser.parse_args()

    ref = Image.open(args.source)
    w = args.width or ref.width
    h = args.height or ref.height
    out_size = (w, h)

    def log(step: int, loss: float) -> None:
        print(f"  step {step:4d}  loss={loss:.6f}")

    print(f"[{args.name}] mode={args.mode}  ref={args.source.name}  out={w}x{h}")
    args.out_dir.mkdir(parents=True, exist_ok=True)

    if args.mode == "gatys":
        cfg = GatysConfig(
            steps=args.steps,
            seed=args.seed,
            grayscale=not args.rgb,
            albedo_blur_sigma=args.albedo_sigma,
        )
        if args.rgb:
            out = synthesize_gatys(ref, out_size=out_size, config=cfg, progress=log)
            out_path = args.out_dir / f"{args.name}_neural_gatys_rgb.png"
            out.save(out_path)
            print(f"-> {out_path}")
        else:
            shading, _albedo, final = synthesize_gatys_shading(
                ref, out_size=out_size, config=cfg, progress=log
            )
            shading_path = args.out_dir / f"{args.name}_neural_gatys_shading.png"
            final_path = args.out_dir / f"{args.name}_neural_gatys_final.png"
            Image.fromarray(shading.astype(np.uint8), mode="L").save(shading_path)
            Image.fromarray(final.astype(np.uint8), mode="RGB").save(final_path)
            print(f"-> {shading_path}")
            print(f"-> {final_path}")
        return

    out = synthesize_vae(
        ref,
        out_size=out_size,
        config=VAEConfig(epochs=args.epochs, seed=args.seed),
        progress=lambda e, loss: log(e, loss),
    )
    out_path = args.out_dir / f"{args.name}_neural_vae.png"
    out.save(out_path)
    print(f"-> {out_path}")


if __name__ == "__main__":
    main()
