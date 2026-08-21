"use client";

import { useTranslations } from "next-intl";

import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import type { StepRenderProps } from "@/features/exercise-runner/steps/types";

export function CaptureStep({
  answer,
  onTextChange,
  onPhotoChange,
}: Pick<StepRenderProps, "answer" | "onTextChange" | "onPhotoChange">) {
  const t = useTranslations("exerciseRunner");

  return (
    <div className="space-y-4 max-md:space-y-2">
      <Field label={t("submitText")}>
        <Input
          value={answer.text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={t("submitTextPlaceholder")}
        />
      </Field>
      <div>
        <label className="mb-2 block text-sm font-medium text-ink">{t("submitPhoto")}</label>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="text-sm text-muted"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) {
              onPhotoChange(null);
              return;
            }
            onPhotoChange(URL.createObjectURL(file));
          }}
        />
        {answer.photoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- session-local blob preview
          <img
            src={answer.photoDataUrl}
            alt=""
            className="mt-2 max-h-40 rounded-lg border border-line max-md:max-h-24"
          />
        ) : null}
      </div>
    </div>
  );
}
