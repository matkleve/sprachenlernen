import { GRAIN_PRESET_IDS, type GrainPresetId } from "@/lib/grain-creator";
import { cn } from "@/lib/utils";

import { page, presetLabels } from "./content";

type GrainPresetPickerProps = {
  activePreset: GrainPresetId | null;
  onPreset: (presetId: GrainPresetId) => void;
};

export function GrainPresetPicker({ activePreset, onPreset }: GrainPresetPickerProps) {
  return (
    <section>
      <p className="text-xs font-medium uppercase tracking-widest text-muted">{page.presetsHeading}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {GRAIN_PRESET_IDS.map((presetId) => {
          const selected = activePreset === presetId;
          return (
            <button
              key={presetId}
              type="button"
              onClick={() => onPreset(presetId)}
              aria-pressed={selected}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium transition",
                selected
                  ? "border-accent bg-accent-soft text-ink"
                  : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
                "active:scale-[0.98]",
              )}
            >
              {presetLabels[presetId]}
            </button>
          );
        })}
      </div>
    </section>
  );
}
