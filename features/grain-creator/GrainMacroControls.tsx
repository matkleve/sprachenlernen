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
        id="grain-seam-dark"
        label={controlLabels.seamDarkOpacity}
        min={0}
        max={1}
        step={0.01}
        value={params.seamDarkOpacity}
        displayValue={params.seamDarkOpacity.toFixed(2)}
        onChange={(value) => onPatch({ seamDarkOpacity: value })}
      />
      <RangeControl
        id="grain-seam-width"
        label={controlLabels.seamWidthPx}
        min={1}
        max={4}
        step={1}
        value={params.seamWidthPx}
        displayValue={`${params.seamWidthPx}px`}
        onChange={(value) => onPatch({ seamWidthPx: value })}
      />
      <RangeControl
        id="grain-gap-width"
        label={controlLabels.gapWidthPx}
        min={20}
        max={120}
        step={1}
        value={params.gapWidthPx}
        displayValue={`${params.gapWidthPx}px`}
        onChange={(value) => onPatch({ gapWidthPx: value })}
      />
      <RangeControl
        id="grain-secondary-seam"
        label={controlLabels.secondarySeamOpacity}
        min={0}
        max={0.6}
        step={0.01}
        value={params.secondarySeamOpacity}
        displayValue={params.secondarySeamOpacity.toFixed(2)}
        onChange={(value) => onPatch({ secondarySeamOpacity: value })}
      />
      <RangeControl
        id="grain-secondary-width"
        label={controlLabels.secondarySeamWidthPx}
        min={1}
        max={4}
        step={1}
        value={params.secondarySeamWidthPx}
        displayValue={`${params.secondarySeamWidthPx}px`}
        onChange={(value) => onPatch({ secondarySeamWidthPx: value })}
      />
      <RangeControl
        id="grain-plank-width"
        label={controlLabels.plankWidthPx}
        min={32}
        max={120}
        step={1}
        value={params.plankWidthPx}
        displayValue={`${params.plankWidthPx}px`}
        onChange={(value) => onPatch({ plankWidthPx: value })}
      />
      <ColorControl
        id="grain-band-a"
        label={controlLabels.bandColorA}
        value={params.bandColorA}
        onChange={(value) => onPatch({ bandColorA: value })}
      />
      <ColorControl
        id="grain-band-b"
        label={controlLabels.bandColorB}
        value={params.bandColorB}
        onChange={(value) => onPatch({ bandColorB: value })}
      />
      <ColorControl
        id="grain-band-c"
        label={controlLabels.bandColorC}
        value={params.bandColorC}
        onChange={(value) => onPatch({ bandColorC: value })}
      />
      <ColorControl
        id="grain-band-d"
        label={controlLabels.bandColorD}
        value={params.bandColorD}
        onChange={(value) => onPatch({ bandColorD: value })}
      />
    </section>
  );
}
