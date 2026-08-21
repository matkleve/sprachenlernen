import type { GrainBlendMode, GrainParams } from "@/lib/grain-creator";
import { cn } from "@/lib/utils";

import { blendModeOptions } from "./content";

type BlendModeSelectProps = {
  id: string;
  label: string;
  value: GrainBlendMode;
  onChange: (value: GrainParams["macroBlendMode"]) => void;
};

export function BlendModeSelect({ id, label, value, onChange }: BlendModeSelectProps) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as GrainBlendMode)}
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
  );
}
