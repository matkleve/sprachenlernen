import type { GrainParams, GrainSizingMode } from "@/lib/grain-creator";
import { cn } from "@/lib/utils";

import { sizingOptions } from "./content";

type SizingSelectProps = {
  id: string;
  label: string;
  value: GrainSizingMode;
  onChange: (value: GrainSizingMode) => void;
};

export function SizingSelect({ id, label, value, onChange }: SizingSelectProps) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as GrainSizingMode)}
        className={cn(
          "mt-2 w-full rounded-card border border-line bg-surface px-3 py-2 text-sm text-ink",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
        )}
      >
        {sizingOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
