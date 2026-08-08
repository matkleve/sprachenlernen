"use client";

import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";

import { useFieldControl } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

/**
 * A styled native <select>. Contract: docs/specs/component/select.md
 *
 * Native on purpose. A custom listbox costs several hundred lines of roving
 * focus, typeahead, virtual cursor handling and mobile fallbacks — and the
 * platform already ships all of it, including the native wheel picker on iOS
 * and Android that people actually prefer. Escalate to a custom listbox only
 * for multi-select, search-within-options, or rich option content, and when you
 * do, it gets its own spec with an explicit state machine.
 */
export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  const field = useFieldControl();

  return (
    <div className="relative">
      <select
        {...field}
        {...props}
        className={cn(
          "h-10 w-full appearance-none rounded-card border bg-surface pl-3 pr-9 text-sm text-ink",
          "transition-[border-color,box-shadow] duration-150 ease-out-soft",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "border-line aria-invalid:border-danger",
          className,
        )}
      >
        {children}
      </select>
      {/* appearance-none removes the platform arrow, so one has to be drawn
          back. pointer-events-none keeps clicks going to the select — without
          it the chevron becomes a dead zone in the middle of the control. */}
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted"
      />
    </div>
  );
}
