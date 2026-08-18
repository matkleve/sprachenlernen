"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type QuestionOption = { id: string; label: string };
type Question = {
  id: string;
  prompt: string;
  options: QuestionOption[];
  correctOptionId?: string;
};

type ComprehensionQuestionsStepProps = {
  config: Record<string, unknown>;
};

function parseQuestions(config: Record<string, unknown>): Question[] {
  if (!Array.isArray(config.questions)) return [];
  return config.questions.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const question = entry as Record<string, unknown>;
    if (typeof question.id !== "string" || typeof question.prompt !== "string") return [];
    if (!Array.isArray(question.options)) return [];
    const options = question.options.flatMap((option) => {
      if (!option || typeof option !== "object") return [];
      const row = option as Record<string, unknown>;
      if (typeof row.id !== "string" || typeof row.label !== "string") return [];
      return [{ id: row.id, label: row.label }];
    });
    if (options.length === 0) return [];
    return [
      {
        id: question.id,
        prompt: question.prompt,
        options,
        correctOptionId:
          typeof question.correctOptionId === "string" ? question.correctOptionId : undefined,
      },
    ];
  });
}

export function ComprehensionQuestionsStep({ config }: ComprehensionQuestionsStepProps) {
  const t = useTranslations("exerciseRunner");
  const questions = parseQuestions(config);
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
            <div className="flex flex-col gap-2">
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
