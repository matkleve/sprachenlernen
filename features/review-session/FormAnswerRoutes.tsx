"use client";

import { Button } from "@/components/ui/Button";
import type { FormAnswerRoute } from "@/lib/form-answer-routes";
import { cn } from "@/lib/utils";

type FormAnswerRoutesProps = {
  value: FormAnswerRoute;
  onChange: (route: FormAnswerRoute) => void;
  typedLabel: string;
  buildLabel: string;
  spokenLabel: string;
  buildAvailable?: boolean;
  routesLabel: string;
  className?: string;
};

export function FormAnswerRoutes({
  value,
  onChange,
  typedLabel,
  buildLabel,
  spokenLabel,
  buildAvailable = true,
  routesLabel,
  className,
}: FormAnswerRoutesProps) {
  const routes: Array<{ id: FormAnswerRoute; label: string }> = [
    { id: "typed", label: typedLabel },
    ...(buildAvailable ? [{ id: "build" as const, label: buildLabel }] : []),
    { id: "spoken", label: spokenLabel },
  ];

  return (
    <div
      role="tablist"
      aria-label={routesLabel}
      className={cn("mt-4 flex gap-2", className)}
    >
      {routes.map((route) => {
        const selected = value === route.id;
        return (
          <Button
            key={route.id}
            type="button"
            role="tab"
            aria-selected={selected}
            variant={selected ? "primary" : "secondary"}
            size="sm"
            className="flex-1"
            onClick={() => onChange(route.id)}
          >
            {route.label}
          </Button>
        );
      })}
    </div>
  );
}
