#!/usr/bin/env python3
"""Fully generative neural wood texture synthesis — no hybrid valley stamping.

Unlike wood-grain-fourier-synthesis.py (which measures crack positions from the
source photo), this script generates a NEW tile from learned statistics only.

Modes
-----
gatys  Match VGG Gram matrices by optimizing random noise (Gatys et al. 2015).
       Best for: same-scale texture with similar grain statistics; slow on CPU.
vae    Train a small conv VAE on augmented crops, sample from the latent prior.
       Best for: fast iteration; quality depends on training epochs.

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
        synthesize_vae,
    )
    from PIL import Image

    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("source", type=Path, help="Reference wood photo (statistics only — not stamped)")
    parser.add_argument("name", type=str, help="Output basename prefix, e.g. wood-01")
    parser.add_argument(
        "mode",
        choices=["gatys", "vae"],
        help="gatys = VGG texture synthesis; vae = latent generator",
    )
    parser.add_argument("--out-dir", type=Path, default=Path("design/progression/synthesized"))
    parser.add_argument("--width", type=int, default=0, help="Output width (default: same as source)")
    parser.add_argument("--height", type=int, default=0, help="Output height (default: same as source)")
    parser.add_argument("--steps", type=int, default=400, help="Gatys optimization steps")
    parser.add_argument("--epochs", type=int, default=80, help="VAE training epochs")
    parser.add_argument("--seed", type=int, default=0)
    args = parser.parse_args()

    ref = Image.open(args.source)
    w = args.width or ref.width
    h = args.height or ref.height
    out_size = (w, h)

    def log(step: int, loss: float) -> None:
        print(f"  step {step:4d}  loss={loss:.6f}")

    print(f"[{args.name}] mode={args.mode}  ref={args.source.name}  out={w}x{h}")
    if args.mode == "gatys":
        out = synthesize_gatys(
            ref,
            out_size=out_size,
            config=GatysConfig(steps=args.steps, seed=args.seed),
            progress=log,
        )
        suffix = "neural_gatys"
    else:
        out = synthesize_vae(
            ref,
            out_size=out_size,
            config=VAEConfig(epochs=args.epochs, seed=args.seed),
            progress=lambda e, loss: log(e, loss),
        )
        suffix = "neural_vae"

    args.out_dir.mkdir(parents=True, exist_ok=True)
    out_path = args.out_dir / f"{args.name}_{suffix}.png"
    out.save(out_path)
    print(f"-> {out_path}")


if __name__ == "__main__":
    main()
