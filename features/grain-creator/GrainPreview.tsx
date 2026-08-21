import { useMemo } from "react";

import {
  buildFibreSvgUri,
  buildMacroGradient,
  grainRepeatHeightPx,
  type GrainParams,
} from "@/lib/grain-creator";

import { page } from "./content";

export function GrainPreview({ params }: { params: GrainParams }) {
  const macroStyle = useMemo(
    () => ({
      backgroundColor: params.baseColor,
      backgroundImage: buildMacroGradient(params),
      backgroundSize: `100% ${grainRepeatHeightPx(params)}px`,
    }),
    [params],
  );

  const fibreStyle = useMemo(
    () => ({
      backgroundImage: buildFibreSvgUri(params),
      backgroundSize: `${params.tileWidthPx}px ${params.tileHeightPx}px`,
      opacity: params.fibreLayerOpacity,
      mixBlendMode: params.blendMode,
      filter: `contrast(${params.fibreContrast}) brightness(${params.fibreBrightness})`,
    }),
    [params],
  );

  return (
    <div
      className="relative isolate min-h-72 overflow-hidden rounded-card border border-line shadow-soft"
      aria-label={page.previewHeading}
    >
      <div className="absolute inset-0" style={macroStyle} />
      <div className="pointer-events-none absolute inset-0" style={fibreStyle} />
    </div>
  );
}
