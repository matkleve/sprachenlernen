"""Fully generative neural wood texture synthesis — no valley stamping.

Modes:
  gatys  — optimize random noise until VGG Gram matrices match the reference
           (Gatys et al. 2015). Default: grayscale relief only, color from albedo.
  vae    — train a small convolutional VAE on augmented crops, sample a new tile
           from the latent prior (fully generative at inference).
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
from scipy.ndimage import gaussian_filter
from torchvision import models, transforms


def _device() -> torch.device:
    return torch.device("cuda" if torch.cuda.is_available() else "cpu")


def _pil_to_tensor(img: Image.Image) -> torch.Tensor:
    """RGB float tensor (1, 3, H, W) in [0, 1]."""
    arr = np.asarray(img.convert("RGB"), dtype=np.float32) / 255.0
    t = torch.from_numpy(arr).permute(2, 0, 1).unsqueeze(0)
    return t


def _tensor_to_pil(t: torch.Tensor) -> Image.Image:
    """(1, 3, H, W) or (3, H, W) in [0, 1] -> PIL RGB."""
    if t.dim() == 4:
        t = t[0]
    arr = (t.detach().clamp(0, 1).permute(1, 2, 0).cpu().numpy() * 255).astype(np.uint8)
    return Image.fromarray(arr, mode="RGB")


def _gram_matrix(features: torch.Tensor) -> torch.Tensor:
    """(1, C, H, W) -> (C, C) Gram matrix."""
    _, c, h, w = features.shape
    f = features.view(c, h * w)
    return torch.mm(f, f.t()) / (c * h * w)


class VGGFeatureExtractor(nn.Module):
    """VGG19 relu layers for Gatys texture synthesis."""

    LAYER_WEIGHTS = {
        "relu1_1": 1.0,
        "relu2_1": 0.9,
        "relu3_1": 0.5,
        "relu4_1": 0.08,  # deep layers → blurry clouds; keep low
        "relu5_1": 0.02,
    }

    def __init__(self) -> None:
        super().__init__()
        vgg = models.vgg19(weights=models.VGG19_Weights.IMAGENET1K_V1).features
        self.slice1 = nn.Sequential(*list(vgg.children())[:2])   # relu1_1
        self.slice2 = nn.Sequential(*list(vgg.children())[2:7])  # relu2_1
        self.slice3 = nn.Sequential(*list(vgg.children())[7:12])
        self.slice4 = nn.Sequential(*list(vgg.children())[12:21])
        self.slice5 = nn.Sequential(*list(vgg.children())[21:30])
        for p in self.parameters():
            p.requires_grad = False

    def forward(self, x: torch.Tensor) -> dict[str, torch.Tensor]:
        h = self.slice1(x)
        out = {"relu1_1": h}
        h = self.slice2(h)
        out["relu2_1"] = h
        h = self.slice3(h)
        out["relu3_1"] = h
        h = self.slice4(h)
        out["relu4_1"] = h
        h = self.slice5(h)
        out["relu5_1"] = h
        return out


def _tensor_to_gray01(t: torch.Tensor) -> np.ndarray:
    """(1, 1, H, W) or (1, 3, H, W) -> float32 (H, W) in [0, 1]."""
    if t.dim() == 4:
        t = t[0]
    if t.shape[0] == 3:
        arr = t.detach().clamp(0, 1).mean(dim=0).cpu().numpy()
    else:
        arr = t.detach().clamp(0, 1)[0].cpu().numpy()
    return arr.astype(np.float32)


def _histogram_match(source: np.ndarray, target_sorted: np.ndarray) -> np.ndarray:
    flat = source.ravel()
    ranks = np.argsort(np.argsort(flat))
    return target_sorted[ranks].reshape(source.shape)


def extract_albedo(img_rgb: np.ndarray, sigma: float = 14.0) -> np.ndarray:
    """Low-frequency wood colour — same separation as FFT pipeline."""
    return np.stack(
        [gaussian_filter(img_rgb[..., c], sigma=sigma) for c in range(3)],
        axis=-1,
    )


def colorize_shading(shading: np.ndarray, albedo: np.ndarray) -> np.ndarray:
    """Relief × colour: final = albedo × (shading / 128)."""
    return np.clip(albedo * (shading[..., None] / 128.0), 0, 255)


def gray_to_shading(gray01: np.ndarray, ref_luminance: np.ndarray) -> np.ndarray:
    """Map generated grey relief to 0–255 shading.

    Preserves Gatys spatial structure; scales mean/std to reference luminance so
    albedo × shading / 128 lands near the right tone (histogram-only match
    darkens after the albedo multiply).
    """
    g = (gray01 - gray01.mean()) / (gray01.std() + 1e-8)
    matched = g * ref_luminance.std() + ref_luminance.mean()
    return np.clip(matched * 255.0, 0, 255)


def suppress_lowfreq_blobs(gray01: np.ndarray, sigma: float = 32.0) -> np.ndarray:
    """Remove large-scale luminance clouds while keeping grain/crack detail.

    Gatys deep VGG layers match low-frequency Gram stats with blobby regions;
  the top of wood-01 often ends up smoother than the bottom.
    """
    low = gaussian_filter(gray01.astype(np.float64), sigma=sigma)
    return np.clip(gray01 - low + low.mean(), 0, 1).astype(np.float32)


def boost_weak_detail(gray01: np.ndarray, window: int = 48, floor_ratio: float = 0.72) -> np.ndarray:
    """Raise grain contrast in locally flat regions (e.g. upper cloud)."""
    from numpy.lib.stride_tricks import sliding_window_view

    win = max(16, window | 1)
    if gray01.shape[0] < win or gray01.shape[1] < win:
        return gray01
    patches = sliding_window_view(gray01, (win, win))
    local_std = patches.std(axis=(-2, -1))
    target = float(gray01.std())
    # map each pixel to its window's std (approximate via stride-1 overlap mean)
    h, w = gray01.shape
    std_map = np.zeros((h, w), dtype=np.float32)
    count = np.zeros((h, w), dtype=np.float32)
    ph, pw = patches.shape[:2]
    for iy in range(ph):
        for ix in range(pw):
            std_map[iy : iy + win, ix : ix + win] += local_std[iy, ix]
            count[iy : iy + win, ix : ix + win] += 1
    std_map /= np.maximum(count, 1)
    weak = std_map < target * floor_ratio
    if not weak.any():
        return gray01
    centered = gray01 - gray01.mean()
    boosted = gray01 + centered * np.where(weak, (target / (std_map + 1e-8) - 1) * 0.35, 0)
    return np.clip(boosted, 0, 1).astype(np.float32)


@dataclass
class GatysConfig:
    steps: int = 400
    lr: float = 0.08
    tv_weight: float = 1e-4
    seed: int = 0
    log_every: int = 50
    grayscale: bool = True
    histogram_match: bool = True
    albedo_blur_sigma: float = 14.0
    lowfreq_suppress_sigma: float = 32.0
    detail_boost: bool = True


def _run_gatys_loop(
    ref_t: torch.Tensor,
    target_grams: dict[str, torch.Tensor],
    out_size: tuple[int, int],
    cfg: GatysConfig,
    device: torch.device,
    vgg: VGGFeatureExtractor,
    progress: Callable[[int, float], None] | None,
    grayscale: bool,
) -> torch.Tensor:
    """Core Gatys optimization — returns tensor (1, C, H, W) in [0, 1]."""
    normalize = transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    w, h = out_size

    if grayscale:
        gen = torch.randn(1, 1, h, w, device=device) * 0.01
    else:
        gen = torch.randn(1, 3, h, w, device=device) * 0.01
    gen.requires_grad_(True)
    opt = torch.optim.Adam([gen], lr=cfg.lr)

    for step in range(cfg.steps):
        opt.zero_grad()
        gen_rgb = gen.repeat(1, 3, 1, 1) if grayscale else gen
        normed = normalize(gen_rgb)
        feats = vgg(normed)
        loss = torch.tensor(0.0, device=device)
        for name, weight in VGGFeatureExtractor.LAYER_WEIGHTS.items():
            g = _gram_matrix(feats[name])
            loss = loss + weight * F.mse_loss(g, target_grams[name])

        dx = gen_rgb[:, :, :, 1:] - gen_rgb[:, :, :, :-1]
        dy = gen_rgb[:, :, 1:, :] - gen_rgb[:, :, :-1, :]
        tv = (dx.abs().mean() + dy.abs().mean()) * cfg.tv_weight
        loss = loss + tv
        loss.backward()
        opt.step()
        with torch.no_grad():
            gen.clamp_(0, 1)

        if progress and (step % cfg.log_every == 0 or step == cfg.steps - 1):
            progress(step, float(loss.item()))

    return gen.repeat(1, 3, 1, 1) if grayscale else gen


def synthesize_gatys_shading(
    reference: Image.Image,
    out_size: tuple[int, int] | None = None,
    config: GatysConfig | None = None,
    progress: Callable[[int, float], None] | None = None,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Gatys on grayscale relief only; colour from blurred reference albedo.

    Returns (shading 0–255, albedo float, final_rgb float).
    Structure is fully generated; albedo carries wood colour only (no crack positions).
    """
    cfg = config or GatysConfig()
    device = _device()
    torch.manual_seed(cfg.seed)

    ref_rgb = reference.convert("RGB")
    if out_size is None:
        out_size = ref_rgb.size
    w, h = out_size

    ref_arr = np.asarray(ref_rgb.resize(out_size, Image.Resampling.LANCZOS), dtype=np.float32)
    ref_lum = ref_arr.mean(axis=-1) / 255.0

    normalize = transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    if cfg.grayscale:
        lum_t = torch.from_numpy(ref_lum).unsqueeze(0).unsqueeze(0).to(device)
        ref_t = normalize(lum_t.repeat(1, 3, 1, 1))
    else:
        ref_t = normalize(_pil_to_tensor(ref_rgb.resize(out_size, Image.Resampling.LANCZOS)).to(device))

    vgg = VGGFeatureExtractor().to(device).eval()
    with torch.no_grad():
        ref_feats = vgg(ref_t)
        target_grams = {k: _gram_matrix(v) for k, v in ref_feats.items()}

    gen = _run_gatys_loop(
        ref_t, target_grams, out_size, cfg, device, vgg, progress, cfg.grayscale
    )
    gray01 = _tensor_to_gray01(gen)
    if cfg.lowfreq_suppress_sigma > 0:
        gray01 = suppress_lowfreq_blobs(gray01, sigma=cfg.lowfreq_suppress_sigma)
    if cfg.detail_boost:
        gray01 = boost_weak_detail(gray01)

    if cfg.histogram_match:
        shading = gray_to_shading(gray01, ref_lum)
    else:
        shading = np.clip(gray01 * 255.0, 0, 255)

    albedo = extract_albedo(ref_arr, sigma=cfg.albedo_blur_sigma)

    # Compensate for albedo × shading / 128 darkening the tile vs raw shading
    preview_lum = (albedo * (shading[..., None] / 128.0)).mean(axis=-1) / 255.0
    tone_scale = ref_lum.mean() / (preview_lum.mean() + 1e-8)
    shading = np.clip(shading.astype(np.float64) * tone_scale, 0, 255)

    final = colorize_shading(shading, albedo)
    return shading, albedo, final


def synthesize_gatys(
    reference: Image.Image,
    out_size: tuple[int, int] | None = None,
    config: GatysConfig | None = None,
    progress: Callable[[int, float], None] | None = None,
) -> Image.Image:
    """Generate RGB texture (legacy) or grayscale+albedo when config.grayscale=True."""
    cfg = config or GatysConfig()
    if cfg.grayscale:
        _, _, final = synthesize_gatys_shading(reference, out_size, cfg, progress)
        return Image.fromarray(final.astype(np.uint8), mode="RGB")

    device = _device()
    torch.manual_seed(cfg.seed)
    ref = reference.convert("RGB")
    if out_size is None:
        out_size = ref.size

    normalize = transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ref_t = normalize(_pil_to_tensor(ref.resize(out_size, Image.Resampling.LANCZOS)).to(device))

    vgg = VGGFeatureExtractor().to(device).eval()
    with torch.no_grad():
        ref_feats = vgg(ref_t)
        target_grams = {k: _gram_matrix(v) for k, v in ref_feats.items()}

    gen = _run_gatys_loop(ref_t, target_grams, out_size, cfg, device, vgg, progress, False)
    return _tensor_to_pil(gen)


@dataclass
class VAEConfig:
    crop_size: int = 128
    latent_dim: int = 64
    epochs: int = 80
    batch_size: int = 16
    lr: float = 2e-3
    kl_weight: float = 0.002
    seed: int = 0
    log_every: int = 10


class WoodVAE(nn.Module):
    """Small conv VAE for wood patch distribution."""

    def __init__(self, latent_dim: int = 64) -> None:
        super().__init__()
        self.enc = nn.Sequential(
            nn.Conv2d(3, 32, 4, 2, 1),
            nn.ReLU(inplace=True),
            nn.Conv2d(32, 64, 4, 2, 1),
            nn.ReLU(inplace=True),
            nn.Conv2d(64, 128, 4, 2, 1),
            nn.ReLU(inplace=True),
            nn.Conv2d(128, 256, 4, 2, 1),
            nn.ReLU(inplace=True),
        )
        self.fc_mu = nn.Linear(256 * 8 * 8, latent_dim)
        self.fc_logvar = nn.Linear(256 * 8 * 8, latent_dim)
        self.fc_dec = nn.Linear(latent_dim, 256 * 8 * 8)
        self.dec = nn.Sequential(
            nn.ConvTranspose2d(256, 128, 4, 2, 1),
            nn.ReLU(inplace=True),
            nn.ConvTranspose2d(128, 64, 4, 2, 1),
            nn.ReLU(inplace=True),
            nn.ConvTranspose2d(64, 32, 4, 2, 1),
            nn.ReLU(inplace=True),
            nn.ConvTranspose2d(32, 3, 4, 2, 1),
            nn.Sigmoid(),
        )

    def encode(self, x: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        h = self.enc(x).reshape(x.size(0), -1)
        return self.fc_mu(h), self.fc_logvar(h)

    def reparameterize(self, mu: torch.Tensor, logvar: torch.Tensor) -> torch.Tensor:
        std = torch.exp(0.5 * logvar)
        eps = torch.randn_like(std)
        return mu + eps * std

    def decode(self, z: torch.Tensor) -> torch.Tensor:
        h = self.fc_dec(z).reshape(z.size(0), 256, 8, 8)
        return self.dec(h)

    def forward(self, x: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        mu, logvar = self.encode(x)
        z = self.reparameterize(mu, logvar)
        return self.decode(z), mu, logvar


def _random_crops(
    img: np.ndarray,
    crop_size: int,
    n: int,
    rng: np.random.Generator,
) -> np.ndarray:
    h, w = img.shape[:2]
    crops = []
    for _ in range(n):
        y = rng.integers(0, max(1, h - crop_size))
        x = rng.integers(0, max(1, w - crop_size))
        patch = img[y : y + crop_size, x : x + crop_size].copy()
        if rng.random() < 0.5:
            patch = np.fliplr(patch)
        if rng.random() < 0.5:
            patch = np.flipud(patch)
        crops.append(patch)
    return np.stack(crops, axis=0)


def synthesize_vae(
    reference: Image.Image,
    out_size: tuple[int, int] | None = None,
    config: VAEConfig | None = None,
    progress: Callable[[int, float], None] | None = None,
) -> Image.Image:
    """Train a VAE on augmented crops, then sample one new full-size tile."""
    cfg = config or VAEConfig()
    device = _device()
    torch.manual_seed(cfg.seed)
    rng = np.random.default_rng(cfg.seed)

    ref = reference.convert("RGB")
    if out_size is None:
        out_size = ref.size
    ref_arr = np.asarray(ref.resize((cfg.crop_size * 4, cfg.crop_size * 4), Image.Resampling.LANCZOS))

    n_crops = max(cfg.batch_size * cfg.epochs, 512)
    crops = _random_crops(ref_arr, cfg.crop_size, n_crops, rng)
    data = torch.from_numpy(crops).permute(0, 3, 1, 2).float() / 255.0

    model = WoodVAE(latent_dim=cfg.latent_dim).to(device)
    opt = torch.optim.Adam(model.parameters(), lr=cfg.lr)

    for epoch in range(cfg.epochs):
        perm = torch.randperm(data.size(0))
        epoch_loss = 0.0
        batches = 0
        for i in range(0, data.size(0), cfg.batch_size):
            batch = data[perm[i : i + cfg.batch_size]].to(device)
            opt.zero_grad()
            recon, mu, logvar = model(batch)
            recon_loss = F.mse_loss(recon, batch)
            kl = -0.5 * torch.mean(1 + logvar - mu.pow(2) - logvar.exp())
            loss = recon_loss + cfg.kl_weight * kl
            loss.backward()
            opt.step()
            epoch_loss += float(loss.item())
            batches += 1
        if progress and (epoch % cfg.log_every == 0 or epoch == cfg.epochs - 1):
            progress(epoch, epoch_loss / max(1, batches))

    # Sample latent and decode at target resolution via overlapping tiles
    model.eval()
    tw, th = out_size
    tile = cfg.crop_size
    canvas = np.zeros((th, tw, 3), dtype=np.float32)
    weight = np.zeros((th, tw, 1), dtype=np.float32)
    stride = tile // 2
    with torch.no_grad():
        for y in range(0, th - tile + 1, stride):
            for x in range(0, tw - tile + 1, stride):
                z = torch.randn(1, cfg.latent_dim, device=device)
                patch = model.decode(z)[0].permute(1, 2, 0).cpu().numpy()
                canvas[y : y + tile, x : x + tile] += patch
                weight[y : y + tile, x : x + tile] += 1.0
    canvas /= np.maximum(weight, 1e-6)
    arr = (np.clip(canvas, 0, 1) * 255).astype(np.uint8)
    return Image.fromarray(arr, mode="RGB")
