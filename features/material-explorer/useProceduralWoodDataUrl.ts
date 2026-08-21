"use client";

import { useEffect, useState } from "react";

import {
  PROCEDURAL_WOOD_PRESETS,
  renderProceduralWoodDataUrl,
  type ProceduralWoodPresetId,
} from "@/lib/procedural-wood";

/** Client-only — canvas is unavailable under SSR/jsdom. */
export function useProceduralWoodDataUrl(preset: ProceduralWoodPresetId): string | null {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    setDataUrl(renderProceduralWoodDataUrl(PROCEDURAL_WOOD_PRESETS[preset]));
  }, [preset]);

  return dataUrl;
}
