"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import {
  focusRing,
  interactiveCursor,
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
 * Prep checklist rows — label left, checkbox right, top-aligned to first line.
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
                "flex min-h-11 items-start gap-3 rounded-card border-x border-line px-3 py-2",
                "max-md:gap-2 max-md:px-2 max-md:py-1.5",
                touchTarget,
                interactiveCursor,
                focusRing,
                isChecked ? "bg-accent-soft" : "bg-surface",
              )}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggle(entry.id)}
                className="sr-only"
              />
              <span className="min-w-0 flex-1 text-base leading-snug text-ink max-md:text-sm">
                {entry.label}
              </span>
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center self-start rounded-md border-2",
                  isChecked
                    ? "border-accent-deep bg-accent-deep text-accent-ink"
                    : "border-line-strong bg-surface",
                )}
                aria-hidden
              >
                {isChecked ? <Check className="size-4" strokeWidth={3} /> : null}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
