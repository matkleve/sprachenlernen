"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type FormAnswerRoute = "typed" | "build";

type FormAnswerRoutesProps = {
  value: FormAnswerRoute;
  onChange: (route: FormAnswerRoute) => void;
  typedLabel: string;
  buildLabel: string;
  className?: string;
};

export function FormAnswerRoutes({
  value,
  onChange,
  typedLabel,
  buildLabel,
  className,
}: FormAnswerRoutesProps) {
  const routes: Array<{ id: FormAnswerRoute; label: string }> = [
    { id: "typed", label: typedLabel },
    { id: "build", label: buildLabel },
  ];

  return (
    <div
      role="tablist"
      aria-label={typedLabel}
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
