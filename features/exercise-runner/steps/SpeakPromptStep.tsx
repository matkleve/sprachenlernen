"use client";

import { useTranslations } from "next-intl";

type SpeakPromptStepProps = {
  config: Record<string, unknown>;
};

/** Read-aloud and production prompts — v1 shows text + instruction; no voice capture yet. */
export function SpeakPromptStep({ config }: SpeakPromptStepProps) {
  const t = useTranslations("exerciseRunner");
  const body = typeof config.body === "string" ? config.body : t("speakPromptDefault");
  const text = typeof config.text === "string" ? config.text : "";

  return (
    <article className="space-y-4">
      <p className="text-lg text-ink">{body}</p>
      {text ? (
        <div className="whitespace-pre-wrap rounded-card border border-line bg-surface-raised p-4 text-base leading-relaxed text-ink">
          {text}
        </div>
      ) : null}
    </article>
  );
}
