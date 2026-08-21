import type { GrainParams } from "@/lib/grain-creator";

import { blendModeOptions, controlLabels, page } from "./content";
import { ColorControl, RangeControl } from "./GrainControlFields";
import { BlendModeSelect } from "./GrainBlendModeSelect";

type GrainMacroControlsProps = {
  params: GrainParams;
  onPatch: (patch: Partial<GrainParams>) => void;
};

export function GrainMacroControls({ params, onPatch }: GrainMacroControlsProps) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-serif text-lg font-semibold text-ink">{page.macroHeading}</h2>
      <p className="text-xs text-muted">
        Low-frequency fractal noise — same idea as a game heightmap: lows become dark valleys,
        highs become lighter ridges after contrast.
      </p>
      <ColorControl
        id="grain-base-color"
        label={controlLabels.baseColor}
        value={params.baseColor}
        onChange={(value) => onPatch({ baseColor: value })}
      />
      <RangeControl
        id="grain-macro-freq-x"
        label={controlLabels.macroFreqX}
        min={0.001}
        max={0.02}
        step={0.001}
        value={params.macroFreqX}
        displayValue={params.macroFreqX.toFixed(3)}
        onChange={(value) => onPatch({ macroFreqX: value })}
      />
      <RangeControl
        id="grain-macro-freq-y"
        label={controlLabels.macroFreqY}
        min={0.005}
        max={0.08}
        step={0.001}
        value={params.macroFreqY}
        displayValue={params.macroFreqY.toFixed(3)}
        onChange={(value) => onPatch({ macroFreqY: value })}
      />
      <RangeControl
        id="grain-macro-octaves"
        label={controlLabels.macroOctaves}
        min={1}
        max={5}
        step={1}
        value={params.macroOctaves}
        displayValue={`${params.macroOctaves}`}
        onChange={(value) => onPatch({ macroOctaves: value })}
      />
      <RangeControl
        id="grain-macro-seed"
        label={controlLabels.macroSeed}
        min={1}
        max={99}
        step={1}
        value={params.macroSeed}
        displayValue={`${params.macroSeed}`}
        onChange={(value) => onPatch({ macroSeed: value })}
      />
      <RangeControl
        id="grain-macro-contrast"
        label={controlLabels.macroContrast}
        min={1}
        max={4}
        step={0.05}
        value={params.macroContrast}
        displayValue={params.macroContrast.toFixed(2)}
        onChange={(value) => onPatch({ macroContrast: value })}
      />
      <RangeControl
        id="grain-macro-brightness"
        label={controlLabels.macroBrightness}
        min={0.5}
        max={1.5}
        step={0.05}
        value={params.macroBrightness}
        displayValue={params.macroBrightness.toFixed(2)}
        onChange={(value) => onPatch({ macroBrightness: value })}
      />
      <RangeControl
        id="grain-macro-opacity"
        label={controlLabels.macroLayerOpacity}
        min={0}
        max={1}
        step={0.01}
        value={params.macroLayerOpacity}
        displayValue={params.macroLayerOpacity.toFixed(2)}
        onChange={(value) => onPatch({ macroLayerOpacity: value })}
      />
      <BlendModeSelect
        id="grain-macro-blend"
        label={controlLabels.macroBlendMode}
        value={params.macroBlendMode}
        onChange={(value) => onPatch({ macroBlendMode: value })}
      />
      <RangeControl
        id="grain-macro-tile-w"
        label={controlLabels.macroTileWidthPx}
        min={256}
        max={768}
        step={16}
        value={params.macroTileWidthPx}
        displayValue={`${params.macroTileWidthPx}px`}
        onChange={(value) => onPatch({ macroTileWidthPx: value })}
      />
      <RangeControl
        id="grain-macro-tile-h"
        label={controlLabels.macroTileHeightPx}
        min={256}
        max={768}
        step={16}
        value={params.macroTileHeightPx}
        displayValue={`${params.macroTileHeightPx}px`}
        onChange={(value) => onPatch({ macroTileHeightPx: value })}
      />
    </section>
  );
}
