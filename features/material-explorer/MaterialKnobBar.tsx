import { cn } from "@/lib/utils";

type MaterialKnobBarProps = {
  label: string;
  value: number;
  /** 0–1 scale for the bar width */
  max?: number;
  hint?: string;
  className?: string;
};

/**
 * Visualises one material knob (grain, roughness, specular…) as a labelled bar.
 * Contract: docs/specs/page/material-explorer.md
 */
export function MaterialKnobBar({ label, value, max = 1, hint, className }: MaterialKnobBarProps) {
  const width = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="font-medium text-ink">{label}</span>
        <span className="tabular-nums text-muted">{value.toFixed(2)}</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-pill bg-line"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
      >
        <div
          className="h-full rounded-pill bg-accent transition-[width] duration-200"
          style={{ width: `${width}%` }}
        />
      </div>
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
