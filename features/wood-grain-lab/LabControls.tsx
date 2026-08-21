import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type RangeControlProps = {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  display: string;
  onChange: (value: number) => void;
};

export function RangeControl({ id, label, min, max, step, value, display, onChange }: RangeControlProps) {
  return (
    <div>
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-sm font-medium text-ink">
        <span>{label}</span>
        <span className="tabular-nums text-muted">{display}</span>
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

type LabSectionProps = {
  title: string;
  children: ReactNode;
};

export function LabSection({ title, children }: LabSectionProps) {
  return (
    <section className="rounded-card border border-line bg-surface p-4 shadow-soft">
      <h2 className="text-xs font-medium uppercase tracking-widest text-muted">{title}</h2>
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  );
}
