import type { GrainParams } from "@/lib/grain-creator";

import { controlLabels, page } from "./content";
import { ColorControl, RangeControl } from "./GrainControlFields";

type GrainMacroControlsProps = {
  params: GrainParams;
  onPatch: (patch: Partial<GrainParams>) => void;
};

export function GrainMacroControls({ params, onPatch }: GrainMacroControlsProps) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-serif text-lg font-semibold text-ink">{page.macroHeading}</h2>
      <ColorControl
        id="grain-base-color"
        label={controlLabels.baseColor}
        value={params.baseColor}
        onChange={(value) => onPatch({ baseColor: value })}
      />
      <RangeControl
        id="grain-valley-dark"
        label={controlLabels.valleyDarkOpacity}
        min={0}
        max={1}
        step={0.01}
        value={params.valleyDarkOpacity}
        displayValue={params.valleyDarkOpacity.toFixed(2)}
        onChange={(value) => onPatch({ valleyDarkOpacity: value })}
      />
      <RangeControl
        id="grain-valley-width"
        label={controlLabels.valleyWidthPx}
        min={1}
        max={4}
        step={1}
        value={params.valleyWidthPx}
        displayValue={`${params.valleyWidthPx}px`}
        onChange={(value) => onPatch({ valleyWidthPx: value })}
      />
      <RangeControl
        id="grain-ridge-lift"
        label={controlLabels.ridgeLiftPx}
        min={0}
        max={12}
        step={1}
        value={params.ridgeLiftPx}
        displayValue={`${params.ridgeLiftPx}px`}
        onChange={(value) => onPatch({ ridgeLiftPx: value })}
      />
      <RangeControl
        id="grain-secondary-valley"
        label={controlLabels.secondaryValleyOpacity}
        min={0}
        max={0.6}
        step={0.01}
        value={params.secondaryValleyOpacity}
        displayValue={params.secondaryValleyOpacity.toFixed(2)}
        onChange={(value) => onPatch({ secondaryValleyOpacity: value })}
      />
      <RangeControl
        id="grain-secondary-width"
        label={controlLabels.secondaryValleyWidthPx}
        min={1}
        max={4}
        step={1}
        value={params.secondaryValleyWidthPx}
        displayValue={`${params.secondaryValleyWidthPx}px`}
        onChange={(value) => onPatch({ secondaryValleyWidthPx: value })}
      />
      <RangeControl
        id="grain-ridge-band"
        label={controlLabels.ridgeBandPx}
        min={2}
        max={16}
        step={1}
        value={params.ridgeBandPx}
        displayValue={`${params.ridgeBandPx}px`}
        onChange={(value) => onPatch({ ridgeBandPx: value })}
      />
      <ColorControl
        id="grain-ridge-a"
        label={controlLabels.ridgeColorA}
        value={params.ridgeColorA}
        onChange={(value) => onPatch({ ridgeColorA: value })}
      />
      <ColorControl
        id="grain-ridge-b"
        label={controlLabels.ridgeColorB}
        value={params.ridgeColorB}
        onChange={(value) => onPatch({ ridgeColorB: value })}
      />
      <ColorControl
        id="grain-ridge-c"
        label={controlLabels.ridgeColorC}
        value={params.ridgeColorC}
        onChange={(value) => onPatch({ ridgeColorC: value })}
      />
      <ColorControl
        id="grain-ridge-d"
        label={controlLabels.ridgeColorD}
        value={params.ridgeColorD}
        onChange={(value) => onPatch({ ridgeColorD: value })}
      />
    </section>
  );
}
