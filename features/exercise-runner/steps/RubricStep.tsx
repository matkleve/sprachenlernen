"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type RubricStepProps = {
  config: Record<string, unknown>;
};

type Dimension = { id: string; label: string; options: string[] };

function parseDimensions(config: Record<string, unknown>): Dimension[] {
  if (!Array.isArray(config.dimensions)) return [];
  return config.dimensions.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const row = entry as Record<string, unknown>;
    if (typeof row.id !== "string" || typeof row.label !== "string") return [];
    const options = Array.isArray(row.options)
      ? row.options.filter((o): o is string => typeof o === "string")
      : [];
    if (options.length === 0) return [];
    return [{ id: row.id, label: row.label, options }];
  });
}

export function RubricStep({ config }: RubricStepProps) {
  const t = useTranslations("exerciseRunner");
  const dimensions = parseDimensions(config);
  const [ratings, setRatings] = useState<Record<string, string>>({});

  if (dimensions.length === 0) {
    return <p className="text-sm text-muted">{t("rubricEmpty")}</p>;
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">{t("rubricIntro")}</p>
      {dimensions.map((dimension) => (
        <fieldset key={dimension.id} className="space-y-2">
          <legend className="text-base font-medium text-ink">{dimension.label}</legend>
          <div className="flex flex-col gap-2">
            {dimension.options.map((option) => (
              <Button
                key={option}
                type="button"
                variant={ratings[dimension.id] === option ? "primary" : "secondary"}
                size="sm"
                className={cn("justify-start")}
                onClick={() =>
                  setRatings((current) => ({ ...current, [dimension.id]: option }))
                }
              >
                {option}
              </Button>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
