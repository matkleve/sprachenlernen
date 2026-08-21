import type { GrainParams, GrainPresetId } from "@/lib/grain-creator";

import { GrainFibreControls } from "./GrainFibreControls";
import { GrainMacroControls } from "./GrainMacroControls";
import { GrainPresetPicker } from "./GrainPresetPicker";

type GrainControlsProps = {
  params: GrainParams;
  activePreset: GrainPresetId | null;
  onPatch: (patch: Partial<GrainParams>) => void;
  onPreset: (presetId: GrainPresetId) => void;
};

export function GrainControls({ params, activePreset, onPatch, onPreset }: GrainControlsProps) {
  return (
    <div className="flex w-full flex-col gap-8 lg:w-96 lg:shrink-0">
      <GrainPresetPicker activePreset={activePreset} onPreset={onPreset} />
      <GrainMacroControls params={params} onPatch={onPatch} />
      <GrainFibreControls params={params} onPatch={onPatch} />
    </div>
  );
}
