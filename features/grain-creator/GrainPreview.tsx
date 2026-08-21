import { useMemo } from "react";

import {
  buildMacroNoiseUri,
  buildMicroNoiseUri,
  buildNoiseBackgroundRepeat,
  buildNoiseBackgroundSize,
  buildNoiseLayerFilter,
  type GrainParams,
} from "@/lib/grain-creator";
import { cn } from "@/lib/utils";

export function GrainPreview({ params, className }: { params: GrainParams; className?: string }) {
  const macroStyle = useMemo(
    () => ({
      backgroundImage: buildMacroNoiseUri(params),
      backgroundSize: buildNoiseBackgroundSize(
        params.macroSizing,
        params.macroTileWidthPx,
        params.macroTileHeightPx,
      ),
      backgroundRepeat: buildNoiseBackgroundRepeat(params.macroSizing),
      opacity: params.macroLayerOpacity,
      mixBlendMode: params.macroBlendMode,
      filter: buildNoiseLayerFilter(params.macroContrast, params.macroBrightness),
    }),
    [params],
  );

  const microStyle = useMemo(
    () => ({
      backgroundImage: buildMicroNoiseUri(params),
      backgroundSize: buildNoiseBackgroundSize(
        params.microSizing,
        params.microTileWidthPx,
        params.microTileHeightPx,
      ),
      backgroundRepeat: buildNoiseBackgroundRepeat(params.microSizing),
      opacity: params.microLayerOpacity,
      mixBlendMode: params.microBlendMode,
      filter: buildNoiseLayerFilter(params.microContrast, params.microBrightness),
    }),
    [params],
  );

  return (
    <div
      className={cn("relative", className)}
      style={{ backgroundColor: params.baseColor }}
      aria-hidden
    >
      <div className="pointer-events-none absolute inset-0" style={macroStyle} />
      <div className="pointer-events-none absolute inset-0" style={microStyle} />
    </div>
  );
}
