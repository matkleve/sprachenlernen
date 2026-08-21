import { useMemo } from "react";

import {
  buildMacroNoiseUri,
  buildMicroNoiseUri,
  buildNoiseLayerFilter,
  type GrainParams,
} from "@/lib/grain-creator";

import { page } from "./content";

export function GrainPreview({ params }: { params: GrainParams }) {
  const macroStyle = useMemo(
    () => ({
      backgroundImage: buildMacroNoiseUri(params),
      backgroundSize: `${params.macroTileWidthPx}px ${params.macroTileHeightPx}px`,
      opacity: params.macroLayerOpacity,
      mixBlendMode: params.macroBlendMode,
      filter: buildNoiseLayerFilter(params.macroContrast, params.macroBrightness),
    }),
    [params],
  );

  const microStyle = useMemo(
    () => ({
      backgroundImage: buildMicroNoiseUri(params),
      backgroundSize: `${params.microTileWidthPx}px ${params.microTileHeightPx}px`,
      opacity: params.microLayerOpacity,
      mixBlendMode: params.microBlendMode,
      filter: buildNoiseLayerFilter(params.microContrast, params.microBrightness),
    }),
    [params],
  );

  return (
    <div
      className="relative isolate min-h-72 overflow-hidden rounded-card border border-line shadow-soft"
      style={{ backgroundColor: params.baseColor }}
      aria-label={page.previewHeading}
    >
      <div className="pointer-events-none absolute inset-0" style={macroStyle} />
      <div className="pointer-events-none absolute inset-0" style={microStyle} />
    </div>
  );
}
