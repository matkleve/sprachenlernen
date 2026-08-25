"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type ParsedOption = {
  id: string;
  labelKey?: string;
  labelLiteral?: string;
};

type ParsedQuestion = {
  id: string;
  promptKey?: string;
  promptLiteral?: string;
  options: ParsedOption[];
  correctOptionId?: string;
};

type QuestionOption = { id: string; label: string };
type Question = {
  id: string;
  prompt: string;
  options: QuestionOption[];
  correctOptionId?: string;
};

function resolveQuestionText(
  t: (key: string) => string,
  key: string | undefined,
  literal: string | undefined,
): string {
  if (key) return t(key);
  return literal ?? "";
}

type ComprehensionQuestionsStepProps = {
  config: Record<string, unknown>;
};

function parseQuestions(config: Record<string, unknown>): ParsedQuestion[] {
  if (!Array.isArray(config.questions)) return [];
  return config.questions.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const question = entry as Record<string, unknown>;
    if (typeof question.id !== "string") return [];
    const promptKey =
      typeof question.promptKey === "string" ? question.promptKey : undefined;
    const promptLiteral =
      typeof question.prompt === "string" ? question.prompt : undefined;
    if (!promptKey && !promptLiteral) return [];
    if (!Array.isArray(question.options)) return [];
    const options = question.options.flatMap((option) => {
      if (!option || typeof option !== "object") return [];
      const row = option as Record<string, unknown>;
      if (typeof row.id !== "string") return [];
      const labelKey = typeof row.labelKey === "string" ? row.labelKey : undefined;
      const labelLiteral = typeof row.label === "string" ? row.label : undefined;
      if (!labelKey && !labelLiteral) return [];
      return [{ id: row.id, labelKey, labelLiteral }];
    });
    if (options.length === 0) return [];
    return [
      {
        id: question.id,
        promptKey,
        promptLiteral,
        options,
        correctOptionId:
          typeof question.correctOptionId === "string" ? question.correctOptionId : undefined,
      },
    ];
  });
}

function toRenderableQuestions(raw: ParsedQuestion[], t: (key: string) => string): Question[] {
  return raw.map((question) => ({
    id: question.id,
    prompt: resolveQuestionText(t, question.promptKey, question.promptLiteral),
    options: question.options.map((option) => ({
      id: option.id,
      label: resolveQuestionText(t, option.labelKey, option.labelLiteral),
    })),
    correctOptionId: question.correctOptionId,
  }));
}

export function ComprehensionQuestionsStep({ config }: ComprehensionQuestionsStepProps) {
  const t = useTranslations("exerciseRunner");
  const questions = toRenderableQuestions(parseQuestions(config), t);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  if (questions.length === 0) {
    return <p className="text-sm text-muted">{t("comprehensionEmpty")}</p>;
  }

  return (
    <div className="space-y-6">
      {questions.map((question) => {
        const selected = answers[question.id];
        const showFeedback = revealed[question.id] && selected;
        const isCorrect =
          question.correctOptionId !== undefined && selected === question.correctOptionId;

        return (
          <fieldset key={question.id} className="space-y-3">
            <legend className="text-base font-medium text-ink">{question.prompt}</legend>
            <div className="flex flex-col gap-2 px-0.5">
              {question.options.map((option) => (
                <Button
                  key={option.id}
                  type="button"
                  variant={selected === option.id ? "primary" : "secondary"}
                  size="sm"
                  className={cn("justify-start")}
                  onClick={() => {
                    setAnswers((current) => ({ ...current, [question.id]: option.id }));
                    setRevealed((current) => ({ ...current, [question.id]: true }));
                  }}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            {showFeedback ? (
              <p className={cn("text-sm", isCorrect ? "text-ink" : "text-muted")}>
                {question.correctOptionId
                  ? isCorrect
                    ? t("comprehensionCorrect")
                    : t("comprehensionIncorrect")
                  : null}
              </p>
            ) : null}
          </fieldset>
        );
      })}
    </div>
  );
}
