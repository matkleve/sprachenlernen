"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/Input";

type ClozeTypeStepProps = {
  config: Record<string, unknown>;
};

export function ClozeTypeStep({ config }: ClozeTypeStepProps) {
  const t = useTranslations("exerciseRunner");
  const before = typeof config.before === "string" ? config.before : "";
  const after = typeof config.after === "string" ? config.after : "";
  const [value, setValue] = useState("");

  return (
    <div className="space-y-2">
      <p className="text-lg leading-relaxed text-ink">
        {before}{" "}
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="inline-block h-9 w-28 px-2 text-base align-middle"
          aria-label={t("clozeBlankLabel")}
          placeholder={t("gapPlaceholder")}
        />{" "}
        {after}
      </p>
    </div>
  );
}
