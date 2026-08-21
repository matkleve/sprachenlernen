import { cn } from "@/lib/utils";

type RangeControlProps = {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  displayValue: string;
  onChange: (value: number) => void;
};

export function RangeControl({
  id,
  label,
  min,
  max,
  step,
  value,
  displayValue,
  onChange,
}: RangeControlProps) {
  return (
    <div>
      <label htmlFor={id} className="flex items-baseline justify-between text-sm font-medium text-ink">
        <span>{label}</span>
        <span className="tabular-nums text-muted">{displayValue}</span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={cn(
          "mt-2 w-full cursor-pointer accent-accent",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      />
    </div>
  );
}

type ColorControlProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function ColorControl({ id, label, value, onChange }: ColorControlProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "size-9 cursor-pointer rounded-card border border-line bg-surface p-0.5",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
        )}
      />
    </div>
  );
}
