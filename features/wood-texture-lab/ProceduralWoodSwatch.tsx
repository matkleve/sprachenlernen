"use client";

import { cn } from "@/lib/utils";

import { useProceduralWoodDataUrl } from "@/features/material-explorer/useProceduralWoodDataUrl";
import {
  PROCEDURAL_WOOD_PRESETS,
  type ProceduralWoodPresetId,
} from "@/lib/procedural-wood";

type ProceduralWoodSwatchProps = {
  preset: ProceduralWoodPresetId;
  className?: string;
  topHighlight?: number;
};

export function ProceduralWoodSwatch({ preset, className, topHighlight = 0 }: ProceduralWoodSwatchProps) {
  const dataUrl = useProceduralWoodDataUrl(preset);
  const fallback = PROCEDURAL_WOOD_PRESETS[preset].dark;

  return (
    <div
      aria-hidden
      className={cn("wood-texture-swatch min-h-48 w-full rounded-card shadow-soft", className)}
      style={{
        backgroundColor: `rgb(${fallback[0]} ${fallback[1]} ${fallback[2]})`,
        backgroundImage: dataUrl
          ? [
              topHighlight > 0
                ? `linear-gradient(180deg, rgb(255 235 200 / ${topHighlight}) 0%, transparent 38%)`
                : null,
              `url("${dataUrl}")`,
            ]
              .filter(Boolean)
              .join(", ")
          : undefined,
        backgroundSize: dataUrl ? (topHighlight > 0 ? "100% 100%, auto" : "auto") : undefined,
        backgroundRepeat: dataUrl ? "no-repeat, repeat" : undefined,
      }}
    />
  );
}
