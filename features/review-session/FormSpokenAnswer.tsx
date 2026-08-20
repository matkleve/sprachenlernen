"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type FormSpokenAnswerProps = {
  instruction: string;
  showAnswerLabel: string;
  onShowAnswer: () => void;
  disabled?: boolean;
  className?: string;
};

export function FormSpokenAnswer({
  instruction,
  showAnswerLabel,
  onShowAnswer,
  disabled = false,
  className,
}: FormSpokenAnswerProps) {
  return (
    <div className={cn("mt-4 text-left", className)}>
      <p className="text-sm text-muted">{instruction}</p>
      <Button
        type="button"
        variant="primary"
        className="mt-4 w-full"
        disabled={disabled}
        onClick={onShowAnswer}
      >
        {showAnswerLabel}
      </Button>
    </div>
  );
}
