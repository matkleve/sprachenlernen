"use client";

import { createContext, useContext, useId, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Label, description, error and the ARIA wiring between them.
 * Contract: docs/specs/component/field.md
 *
 * Field owns the ids; controls read them from context. That is the whole point:
 * the wiring between a label, its hint, its error and its input is the single
 * most commonly broken thing in a form, and it is broken silently — the form
 * looks fine and is unusable with a screen reader. Doing it once here means no
 * caller has to remember `htmlFor`, `aria-describedby` and `aria-invalid` again.
 */

type FieldContextValue = {
  controlId: string;
  describedBy: string | undefined;
  invalid: boolean;
  required: boolean;
};

const FieldContext = createContext<FieldContextValue | null>(null);

/**
 * Props a control must spread to be wired into its Field.
 * Returns `{}` outside a Field, so controls also work standalone.
 */
export function useFieldControl() {
  const field = useContext(FieldContext);
  if (!field) return {};

  return {
    id: field.controlId,
    "aria-describedby": field.describedBy,
    // `aria-invalid="false"` is noise; omit the attribute when valid.
    "aria-invalid": field.invalid || undefined,
    required: field.required || undefined,
  } as const;
}

export type FieldProps = {
  label: ReactNode;
  /** Help shown before the control. Announced with it, not instead of it. */
  description?: ReactNode;
  /** Present means invalid. Absence is the only "valid" signal. */
  error?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

export function Field({
  label,
  description,
  error,
  required = false,
  children,
  className,
}: FieldProps) {
  const id = useId();
  const controlId = `${id}-control`;
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  // Order matters: a screen reader reads describedby in the order given, and
  // the hint before the error is what the user needs to hear.
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <FieldContext.Provider
      value={{ controlId, describedBy, invalid: Boolean(error), required }}
    >
      <div className={cn("flex flex-col gap-1.5", className)}>
        {/* A real <label for> — not aria-label. Clicking it focuses the
            control, which an aria-label does not give you, and that hit area
            matters more on touch than the control itself. */}
        <label htmlFor={controlId} className="text-sm font-medium text-ink">
          {label}
          {required ? (
            <>
              {" "}
              <span className="text-danger" aria-hidden>
                *
              </span>
              <span className="sr-only">(required)</span>
            </>
          ) : null}
        </label>

        {description ? (
          <p id={descriptionId} className="text-sm text-muted">
            {description}
          </p>
        ) : null}

        {children}

        {/* role="alert" so an error appearing after submit is announced even
            when focus is elsewhere. It is also in aria-describedby, so it is
            read again on focus — mild duplication, chosen over silence.
            For a whole form, add an error summary that takes focus on submit;
            a single field cannot solve that. */}
        {error ? (
          <p id={errorId} role="alert" className="text-sm font-medium text-danger">
            {error}
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}
