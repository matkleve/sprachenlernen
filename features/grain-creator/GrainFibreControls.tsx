import type { GrainParams } from "@/lib/grain-creator";

import { controlLabels, page } from "./content";
import { BlendModeSelect } from "./GrainBlendModeSelect";
import { RangeControl } from "./GrainControlFields";

type GrainFibreControlsProps = {
  params: GrainParams;
  onPatch: (patch: Partial<GrainParams>) => void;
};

export function GrainFibreControls({ params, onPatch }: GrainFibreControlsProps) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-serif text-lg font-semibold text-ink">{page.microHeading}</h2>
      <p className="text-xs text-muted">
        Higher-frequency octaves on top — like adding detail layers to the terrain mesh.
      </p>
      <RangeControl
        id="grain-micro-freq-x"
        label={controlLabels.microFreqX}
        min={0.005}
        max={0.05}
        step={0.001}
        value={params.microFreqX}
        displayValue={params.microFreqX.toFixed(3)}
        onChange={(value) => onPatch({ microFreqX: value })}
      />
      <RangeControl
        id="grain-micro-freq-y"
        label={controlLabels.microFreqY}
        min={0.1}
        max={0.9}
        step={0.01}
        value={params.microFreqY}
        displayValue={params.microFreqY.toFixed(2)}
        onChange={(value) => onPatch({ microFreqY: value })}
      />
      <RangeControl
        id="grain-micro-octaves"
        label={controlLabels.microOctaves}
        min={1}
        max={6}
        step={1}
        value={params.microOctaves}
        displayValue={`${params.microOctaves}`}
        onChange={(value) => onPatch({ microOctaves: value })}
      />
      <RangeControl
        id="grain-micro-seed"
        label={controlLabels.microSeed}
        min={1}
        max={99}
        step={1}
        value={params.microSeed}
        displayValue={`${params.microSeed}`}
        onChange={(value) => onPatch({ microSeed: value })}
      />
      <RangeControl
        id="grain-micro-contrast"
        label={controlLabels.microContrast}
        min={0.5}
        max={3}
        step={0.05}
        value={params.microContrast}
        displayValue={params.microContrast.toFixed(2)}
        onChange={(value) => onPatch({ microContrast: value })}
      />
      <RangeControl
        id="grain-micro-brightness"
        label={controlLabels.microBrightness}
        min={0.5}
        max={1.5}
        step={0.05}
        value={params.microBrightness}
        displayValue={params.microBrightness.toFixed(2)}
        onChange={(value) => onPatch({ microBrightness: value })}
      />
      <RangeControl
        id="grain-micro-opacity"
        label={controlLabels.microLayerOpacity}
        min={0}
        max={1}
        step={0.01}
        value={params.microLayerOpacity}
        displayValue={params.microLayerOpacity.toFixed(2)}
        onChange={(value) => onPatch({ microLayerOpacity: value })}
      />
      <BlendModeSelect
        id="grain-micro-blend"
        label={controlLabels.microBlendMode}
        value={params.microBlendMode}
        onChange={(value) => onPatch({ microBlendMode: value })}
      />
      <RangeControl
        id="grain-micro-tile-w"
        label={controlLabels.microTileWidthPx}
        min={120}
        max={400}
        step={4}
        value={params.microTileWidthPx}
        displayValue={`${params.microTileWidthPx}px`}
        onChange={(value) => onPatch({ microTileWidthPx: value })}
      />
      <RangeControl
        id="grain-micro-tile-h"
        label={controlLabels.microTileHeightPx}
        min={48}
        max={200}
        step={4}
        value={params.microTileHeightPx}
        displayValue={`${params.microTileHeightPx}px`}
        onChange={(value) => onPatch({ microTileHeightPx: value })}
      />
    </section>
  );
}
