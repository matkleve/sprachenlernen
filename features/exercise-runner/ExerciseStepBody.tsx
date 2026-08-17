"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import type { ExerciseRunnerState } from "@/lib/exercise-runner";

type ExerciseStepBodyProps = {
  step: ExerciseRunnerState["recipe"]["steps"][number];
  submitDraft: ExerciseRunnerState["submitDraft"];
  markedErrorTokens: string[];
  onTextChange: (text: string) => void;
  onPhotoChange: (photoDataUrl: string | null) => void;
  onToggleError: (token: string) => void;
  onDecline: () => void;
  onSelectOffer: () => void;
};

export function ExerciseStepBody({
  step,
  submitDraft,
  markedErrorTokens,
  onTextChange,
  onPhotoChange,
  onToggleError,
  onDecline,
  onSelectOffer,
}: ExerciseStepBodyProps) {
  const t = useTranslations("exerciseRunner");

  if (step.type === "prepare") {
    const items = Array.isArray(step.config.items)
      ? (step.config.items as string[])
      : [];

    return (
      <div className="space-y-4">
        <p className="text-sm font-medium text-ink">{t("prepareChecklist")}</p>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item} className="flex items-center gap-2 text-base text-ink">
              <span className="size-4 rounded border border-line" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (step.type === "do") {
    const body = typeof step.config.body === "string" ? step.config.body : "";
    return <p className="text-lg text-ink">{body}</p>;
  }

  if (step.type === "wait") {
    return (
      <p className="text-base text-muted">
        {typeof step.config.durationSec === "number"
          ? `${step.config.durationSec}s`
          : ""}
      </p>
    );
  }

  if (step.type === "submit") {
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
          <label className="mb-2 block text-sm font-medium text-ink">
            {t("submitPhoto")}
          </label>
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

  if (step.type === "review") {
    const answerKey =
      typeof step.config.answerKey === "string" ? step.config.answerKey : "";
    const tokens = answerKey.split(/\s+/).filter(Boolean);
    const isFeedback = step.component === "feedback";

    return (
      <div className="space-y-4">
        {isFeedback ? (
          <p className="text-sm text-muted">{t("feedbackPlaceholder")}</p>
        ) : null}
        <p className="text-sm font-medium text-ink">{t("reviewAnswerKey")}</p>
        <p className="text-base text-ink">{answerKey}</p>
        <p className="text-sm text-muted">{t("reviewMarkErrors")}</p>
        <div className="flex flex-wrap gap-2">
          {tokens.map((token) => {
            const selected = markedErrorTokens.includes(token);
            return (
              <Button
                key={token}
                type="button"
                variant={selected ? "primary" : "secondary"}
                size="sm"
                className="rounded-pill"
                onClick={() => onToggleError(token)}
              >
                {token}
              </Button>
            );
          })}
        </div>
      </div>
    );
  }

  if (step.type === "decide") {
    const offers = Array.isArray(step.config.offers)
      ? (step.config.offers as string[])
      : [];

    return (
      <div className="space-y-3">
        {offers.slice(0, 2).map((offer) => (
          <Button key={offer} type="button" className="w-full" onClick={onSelectOffer}>
            {offer}
          </Button>
        ))}
        <Button type="button" variant="secondary" className="w-full" onClick={onDecline}>
          {t("decline")}
        </Button>
      </div>
    );
  }

  return null;
}
