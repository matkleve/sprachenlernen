"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { Field } from "@/components/ui/Field";

type TimedWriteStepProps = {
  config: Record<string, unknown>;
};

export function TimedWriteStep({ config }: TimedWriteStepProps) {
  const t = useTranslations("exerciseRunner");
  const prompt =
    typeof config.prompt === "string" ? config.prompt : t("timedWriteDefault");
  const durationSec =
    typeof config.durationSec === "number" && config.durationSec > 0
      ? config.durationSec
      : 600;
  const minSentences =
    typeof config.minSentences === "number" ? config.minSentences : undefined;
  const [remaining, setRemaining] = useState(durationSec);
  const [text, setText] = useState("");

  useEffect(() => {
    setRemaining(durationSec);
  }, [durationSec]);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = window.setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [remaining]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div className="space-y-4">
      <p className="text-lg text-ink">{prompt}</p>
      {minSentences !== undefined ? (
        <p className="text-sm text-muted">{t("typeFreelyMinSentences", { count: minSentences })}</p>
      ) : null}
      <p
        className="rounded-full bg-accent-soft px-3 py-1 text-sm font-medium text-ink"
        aria-live="polite"
      >
        {remaining > 0
          ? t("timedWriteRemaining", { minutes, seconds: String(seconds).padStart(2, "0") })
          : t("timedWriteExpired")}
      </p>
      <Field label={t("timedWriteLabel")}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-32 w-full rounded-lg border border-line bg-surface px-3 py-2 text-base text-ink"
          placeholder={t("submitTextPlaceholder")}
        />
      </Field>
    </div>
  );
}
