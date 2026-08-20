"use client";

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

import { useFieldControl } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

/**
 * Text controls. Contract: docs/specs/component/field.md
 *
 * Input and Textarea live together because they are one contract with two
 * elements — identical styling, identical states, identical Field wiring.
 * Splitting them would mean maintaining the same class string twice.
 */

const control = [
  "w-full rounded-card border bg-surface px-3 py-2 text-sm text-ink",
  "placeholder:text-muted",
  "transition-[border-color,box-shadow] duration-150 ease-out-soft",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
  "focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
  "disabled:cursor-not-allowed disabled:opacity-50",
  // The invalid border comes from the ARIA state, not a separate prop — so the
  // visual and the assistive-technology signal cannot disagree.
  "border-line aria-invalid:border-danger",
];

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    const field = useFieldControl();
    return (
      <input
        ref={ref}
        {...field}
        {...props}
        className={cn(control, "h-10", className)}
      />
    );
  },
);

export function Textarea({
  className,
  rows = 4,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const field = useFieldControl();
  return <textarea rows={rows} {...field} {...props} className={cn(control, className)} />;
}
