"use client";

import { useRef, type FormEvent } from "react";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { SPANISH_ACCENT_STRIP } from "@/lib/form-accent-chars";
import { cn } from "@/lib/utils";

type FormAnswerInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  label: string;
  checkLabel: string;
  accentStripLabel: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
};

export function FormAnswerInput({
  value,
  onChange,
  onSubmit,
  label,
  checkLabel,
  accentStripLabel,
  disabled = false,
  autoFocus = false,
  className,
}: FormAnswerInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const insertAccent = (accent: string) => {
    const input = inputRef.current;
    if (!input) {
      onChange(value + accent);
      return;
    }

    const start = input.selectionStart ?? value.length;
    const end = input.selectionEnd ?? value.length;
    const next = value.slice(0, start) + accent + value.slice(end);
    onChange(next);
    const caret = start + accent.length;
    window.requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(caret, caret);
    });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!disabled && value.trim()) onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className={cn("mt-4", className)}>
      <Field label={label}>
        <Input
          ref={inputRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="done"
          inputMode="text"
          aria-label={label}
        />
      </Field>

      <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label={accentStripLabel}>
        {SPANISH_ACCENT_STRIP.map((accent) => (
          <Button
            key={accent}
            type="button"
            variant="secondary"
            size="sm"
            disabled={disabled}
            onClick={() => insertAccent(accent)}
            className="min-w-9 px-2 font-medium"
          >
            {accent}
          </Button>
        ))}
      </div>

      <Button
        type="submit"
        variant="primary"
        className="mt-4 w-full"
        disabled={disabled || !value.trim()}
      >
        {checkLabel}
      </Button>
    </form>
  );
}
