"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Check } from "lucide-react";
import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react";

import {
  focusRing,
  interactionMotion,
  interactiveCursor,
  pressScale,
  touchTarget,
} from "@/components/ui/interaction-kernel";
import { cn } from "@/lib/utils";

const checkboxMarker = cva(
  [
    "flex shrink-0 items-center justify-center rounded-md border-2 border-line-strong bg-surface",
    interactionMotion,
    pressScale,
    "peer-focus-visible:outline-none",
    "peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-canvas",
    "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
    "group-hover:border-accent",
  ],
  {
    variants: {
      size: {
        md: "size-6 [&_svg]:size-4",
        sm: "size-5 [&_svg]:size-3.5",
      },
      checked: {
        true: "border-accent-deep bg-accent-deep text-accent-ink group-hover:border-accent-deep",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      checked: false,
    },
  },
);

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> &
  VariantProps<typeof checkboxMarker> & {
    label?: ReactNode;
    labelClassName?: string;
    markerClassName?: string;
  };

/**
 * Checkbox primitive — sr-only input + custom marker. Contract:
 * docs/specs/component/checkbox.md
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    className,
    label,
    labelClassName,
    markerClassName,
    size = "md",
    checked,
    defaultChecked,
    disabled,
    id,
    onChange,
    ...props
  },
  ref,
) {
  const isControlled = checked !== undefined;
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked ?? false);
  const isChecked = isControlled ? checked === true : uncontrolledChecked;

  const handleChange: InputHTMLAttributes<HTMLInputElement>["onChange"] = (event) => {
    if (!isControlled) {
      setUncontrolledChecked(event.target.checked);
    }
    onChange?.(event);
  };

  const control = (
    <>
      <input
        ref={ref}
        id={id}
        type="checkbox"
        checked={isControlled ? checked : undefined}
        defaultChecked={isControlled ? undefined : defaultChecked}
        disabled={disabled}
        onChange={handleChange}
        className="peer sr-only"
        {...props}
      />
      <span
        className={cn(checkboxMarker({ size, checked: isChecked }), markerClassName)}
        aria-hidden
      >
        {isChecked ? <Check strokeWidth={3} aria-hidden /> : null}
      </span>
    </>
  );

  if (label) {
    return (
      <label
        className={cn(
          "group inline-flex items-start gap-2",
          touchTarget,
          interactiveCursor,
          focusRing,
          disabled && "pointer-events-none opacity-50",
          labelClassName,
          className,
        )}
      >
        {control}
        <span className="text-sm leading-snug text-muted">{label}</span>
      </label>
    );
  }

  return <span className={cn("inline-flex shrink-0", className)}>{control}</span>;
});
