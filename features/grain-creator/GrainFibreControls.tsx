import { useId } from "react";

import type { GrainParams } from "@/lib/grain-creator";
import { cn } from "@/lib/utils";

import { blendModeOptions, controlLabels, page } from "./content";
import { RangeControl } from "./GrainControlFields";

type GrainFibreControlsProps = {
  params: GrainParams;
  onPatch: (patch: Partial<GrainParams>) => void;
};

export function GrainFibreControls({ params, onPatch }: GrainFibreControlsProps) {
  const blendId = useId();

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-serif text-lg font-semibold text-ink">{page.fibreHeading}</h2>
      <RangeControl
        id="grain-freq-x"
        label={controlLabels.freqX}
        min={0.005}
        max={0.08}
        step={0.005}
        value={params.freqX}
        displayValue={params.freqX.toFixed(3)}
        onChange={(value) => onPatch({ freqX: value })}
      />
      <RangeControl
        id="grain-freq-y"
        label={controlLabels.freqY}
        min={0.1}
        max={0.9}
        step={0.01}
        value={params.freqY}
        displayValue={params.freqY.toFixed(2)}
        onChange={(value) => onPatch({ freqY: value })}
      />
      <RangeControl
        id="grain-octaves"
        label={controlLabels.octaves}
        min={1}
        max={6}
        step={1}
        value={params.octaves}
        displayValue={`${params.octaves}`}
        onChange={(value) => onPatch({ octaves: value })}
      />
      <RangeControl
        id="grain-tile-width"
        label={controlLabels.tileWidthPx}
        min={120}
        max={400}
        step={4}
        value={params.tileWidthPx}
        displayValue={`${params.tileWidthPx}px`}
        onChange={(value) => onPatch({ tileWidthPx: value })}
      />
      <RangeControl
        id="grain-tile-height"
        label={controlLabels.tileHeightPx}
        min={48}
        max={200}
        step={4}
        value={params.tileHeightPx}
        displayValue={`${params.tileHeightPx}px`}
        onChange={(value) => onPatch({ tileHeightPx: value })}
      />
      <RangeControl
        id="grain-svg-opacity"
        label={controlLabels.fibreSvgOpacity}
        min={0.1}
        max={1}
        step={0.01}
        value={params.fibreSvgOpacity}
        displayValue={params.fibreSvgOpacity.toFixed(2)}
        onChange={(value) => onPatch({ fibreSvgOpacity: value })}
      />
      <RangeControl
        id="grain-layer-opacity"
        label={controlLabels.fibreLayerOpacity}
        min={0}
        max={1}
        step={0.01}
        value={params.fibreLayerOpacity}
        displayValue={params.fibreLayerOpacity.toFixed(2)}
        onChange={(value) => onPatch({ fibreLayerOpacity: value })}
      />
      <RangeControl
        id="grain-contrast"
        label={controlLabels.fibreContrast}
        min={0.5}
        max={3}
        step={0.05}
        value={params.fibreContrast}
        displayValue={params.fibreContrast.toFixed(2)}
        onChange={(value) => onPatch({ fibreContrast: value })}
      />
      <RangeControl
        id="grain-brightness"
        label={controlLabels.fibreBrightness}
        min={0.5}
        max={1.5}
        step={0.05}
        value={params.fibreBrightness}
        displayValue={params.fibreBrightness.toFixed(2)}
        onChange={(value) => onPatch({ fibreBrightness: value })}
      />
      <div>
        <label htmlFor={blendId} className="text-sm font-medium text-ink">
          {controlLabels.blendMode}
        </label>
        <select
          id={blendId}
          value={params.blendMode}
          onChange={(event) =>
            onPatch({ blendMode: event.target.value as GrainParams["blendMode"] })
          }
          className={cn(
            "mt-2 w-full rounded-card border border-line bg-surface px-3 py-2 text-sm text-ink",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            "focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
          )}
        >
          {blendModeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}
