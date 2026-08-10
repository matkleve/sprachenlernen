"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { copy, type Item } from "./content";

/**
 * Contract: docs/specs/feature/item-picker.md
 * Use case:  docs/use-cases/UC-001-inspect-one-item-from-a-list.md
 *
 * The worked example of the state-coherence contract
 * (docs/WORKFLOW.md § The state-coherence contract).
 */
export function ItemPicker({ items }: { items: Item[] }) {
  // THE contract, in one line: selection is a single value, and it is the only
  // thing stored. Everything the user sees is derived from it below.
  //
  // Do not add `const [selectedItem, setSelectedItem] = useState()` alongside
  // this, or a `title` state, or a copy of the body. The moment a second
  // surface owns its own copy, the two can disagree — which is exactly the bug
  // this feature exists to make impossible.
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = items.find((item) => item.id === selectedId) ?? null;

  return (
    <div className="grid gap-6 sm:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
      <nav aria-label={copy.listLabel}>
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  // aria-current is what tells a screen reader which row is the
                  // active one. The visual highlight alone conveys nothing.
                  aria-current={isSelected ? "true" : undefined}
                  onClick={() => setSelectedId(item.id)}
                  className={cn(
                    "w-full touch-manipulation rounded-card px-4 py-3 text-left text-sm transition-[background-color,color,transform] duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
                    "active:scale-[0.98]",
                    isSelected
                      ? "bg-accent-soft font-medium text-ink"
                      : "text-muted hover:bg-accent-soft hover:text-ink",
                  )}
                >
                  {item.title}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Announced on change, politely — the selection happens elsewhere on
          screen, so without this a screen reader user gets no feedback. */}
      <section
        aria-live="polite"
        className="rounded-card border border-line bg-surface p-6 shadow-soft"
      >
        {selected ? (
          <>
            <h2 className="text-lg font-semibold text-ink">{selected.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{selected.body}</p>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-ink">{copy.emptyTitle}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{copy.emptyBody}</p>
          </>
        )}
      </section>
    </div>
  );
}
