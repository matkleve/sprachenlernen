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
 * Large prep rows with real checkboxes — whole row toggles. Contract:
 * docs/specs/feature/practice-surface.md
 */
export function PracticePrepList({ entries, className }: PracticePrepListProps) {
  const [checked, setChecked] = useState<Readonly<Record<string, boolean>>>({});

  if (entries.length === 0) return null;

  const toggle = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <ul className={cn("space-y-2", className)}>
      {entries.map((entry) => {
        const isChecked = checked[entry.id] === true;
        return (
          <li key={entry.id}>
            <label
              className={cn(
                "group flex min-h-11 items-center gap-3 rounded-card px-4 py-3",
                touchTarget,
                interactiveCursor,
                focusRing,
                interactionMotion,
                isChecked
                  ? "bg-accent-soft ring-1 ring-inset ring-accent"
                  : "bg-surface-raised shadow-soft",
              )}
            >
              <Checkbox checked={isChecked} onChange={() => toggle(entry.id)} />
              <span className="text-base font-semibold leading-snug text-ink">{entry.label}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
