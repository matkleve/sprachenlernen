"use client";

import { useState } from "react";

import { OptionButton } from "@/components/ui/OptionButton";
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
 * Prep checklist rows — full-width option buttons. Contract:
 * docs/specs/feature/practice-surface.md
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
            <OptionButton
              layout="row"
              selected={isChecked}
              onClick={() => toggle(entry.id)}
            >
              {entry.label}
            </OptionButton>
          </li>
        );
      })}
    </ul>
  );
}
