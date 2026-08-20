"use client";

import { useState } from "react";

import { Checkbox } from "@/components/ui/Checkbox";
import {
  focusRing,
  interactiveCursor,
  interactionMotion,
  touchTarget,
} from "@/components/ui/interaction-kernel";
import { cn } from "@/lib/utils";

export type PracticePrepEntry = {
  id: string;
  label: string;
};

type PracticePrepListProps = {
  entries: readonly PracticePrepEntry[];
  className?: string;
};

/**
 * Prep checklist rows — label left, checkbox right, vertically centered.
 * Contract: docs/specs/feature/practice-surface.md
 */
export function PracticePrepList({ entries, className }: PracticePrepListProps) {
  const [checked, setChecked] = useState<Readonly<Record<string, boolean>>>({});

  if (entries.length === 0) return null;

  const toggle = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <ul className={cn("space-y-2 max-md:space-y-1.5", className)}>
      {entries.map((entry) => {
        const isChecked = checked[entry.id] === true;
        return (
          <li key={entry.id}>
            <label
              className={cn(
                "group flex min-h-11 items-center gap-3 rounded-card border-x border-line-strong px-4 py-3",
                "max-md:gap-2 max-md:px-3 max-md:py-2",
                touchTarget,
                interactiveCursor,
                focusRing,
                interactionMotion,
                isChecked ? "bg-accent-soft" : "bg-surface",
              )}
            >
              <span className="min-w-0 flex-1 text-base font-semibold leading-snug text-ink max-md:text-sm">
                {entry.label}
              </span>
              <Checkbox checked={isChecked} onChange={() => toggle(entry.id)} />
            </label>
          </li>
        );
      })}
    </ul>
  );
}
