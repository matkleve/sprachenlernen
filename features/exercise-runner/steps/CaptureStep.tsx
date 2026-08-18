"use client";

import { useTranslations } from "next-intl";

import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import type { StepRenderProps } from "@/features/exercise-runner/steps/types";

export function CaptureStep({
  submitDraft,
  onTextChange,
  onPhotoChange,
}: Pick<StepRenderProps, "submitDraft" | "onTextChange" | "onPhotoChange">) {
  const t = useTranslations("exerciseRunner");

  return (
    <div className="space-y-4">
      <Field label={t("submitText")}>
        <Input
          value={submitDraft.text}
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
        {submitDraft.photoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- session-local blob preview
          <img
            src={submitDraft.photoDataUrl}
            alt=""
            className="mt-2 max-h-40 rounded-lg border border-line"
          />
        ) : null}
      </div>
    </div>
  );
}
