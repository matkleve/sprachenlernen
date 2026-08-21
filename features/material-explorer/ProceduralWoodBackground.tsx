"use client";

import { cn } from "@/lib/utils";

import { useProceduralWoodDataUrl } from "@/features/material-explorer/useProceduralWoodDataUrl";
import {
  PROCEDURAL_WOOD_PRESETS,
  type ProceduralWoodPresetId,
} from "@/lib/procedural-wood";

type ProceduralWoodBackgroundProps = {
  preset: ProceduralWoodPresetId;
  className?: string;
  /** 0–1 vignette for scene depth */
  vignette?: number;
  /** 0–1 warm top wash (oiled highlight) */
  topHighlight?: number;
};

/**
 * Canvas-rendered seamless wood tile (Texturize-style rings + warp).
 * Replaces feTurbulence/CSS line stacks for Workshop scenes.
 */
export function ProceduralWoodBackground({
  preset,
  className,
  vignette = 0,
  topHighlight = 0,
}: ProceduralWoodBackgroundProps) {
  const dataUrl = useProceduralWoodDataUrl(preset);
  const tileSize = PROCEDURAL_WOOD_PRESETS[preset].size;
  const fallback = PROCEDURAL_WOOD_PRESETS[preset].dark;
  const fallbackCss = `rgb(${fallback[0]} ${fallback[1]} ${fallback[2]})`;

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]", className)}
      style={{
        backgroundColor: fallbackCss,
        backgroundImage: dataUrl
          ? [
              topHighlight > 0
                ? `linear-gradient(180deg, rgb(255 220 180 / ${topHighlight}) 0%, transparent 42%)`
                : null,
              vignette > 0
                ? `radial-gradient(ellipse 130% 90% at 50% 110%, rgb(0 0 0 / ${vignette}) 0%, transparent 55%)`
                : null,
              `url("${dataUrl}")`,
            ]
              .filter(Boolean)
              .join(", ")
          : vignette > 0
            ? `radial-gradient(ellipse 130% 90% at 50% 110%, rgb(0 0 0 / ${vignette}) 0%, transparent 55%)`
            : undefined,
        backgroundSize: dataUrl
          ? [
              topHighlight > 0 ? "100% 100%" : null,
              vignette > 0 ? "100% 100%" : null,
              `${tileSize}px ${tileSize}px`,
            ]
              .filter(Boolean)
              .join(", ")
          : undefined,
        backgroundRepeat: dataUrl ? "no-repeat, no-repeat, repeat" : undefined,
      }}
    />
  );
}
