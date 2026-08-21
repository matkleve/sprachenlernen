"use client";

import { forwardRef, type ChangeEvent } from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";

/** Two ruled lines. Enough for one sentence; a third would invite a paragraph. */
export const SENTENCE_LINES = 2;

/** Shared by the field and the checked view so the layout cannot shift between them. */
const LINE_BOX = cn(
  "text-lg leading-[2rem] max-md:text-base max-md:leading-[1.75rem]",
  "h-[4rem] max-md:h-[3.5rem]",
);

type SentenceLinesProps = {
  value: string;
  onChange: (text: string) => void;
  /** Tokens with their flags — present once a check has returned. */
  checked: { tokens: string[]; flagged: ReadonlySet<number> } | null;
};

/**
 * The writing surface. Contract: docs/specs/service/sentence-check.md
 *
 * Ruled lines rather than a bordered field: this reads as paper, and the
 * checked view can take the same two lines without the page moving under the
 * learner's eyes.
 */
export const SentenceLines = forwardRef<HTMLTextAreaElement, SentenceLinesProps>(
  function SentenceLines({ value, onChange, checked }, ref) {
    const t = useTranslations("exerciseRunner");

    /**
     * The two-line cap is enforced by measuring, not by counting characters:
     * what fits depends on the words and the screen width, so a character
     * budget would cut one learner off mid-sentence and let another write a
     * paragraph.
     *
     * `scrollHeight` already reflects the new value here, so an overlong edit
     * is rejected by putting the element's value back — React state never sees
     * it and the caret stays where the learner left it.
     */
    function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
      const element = event.currentTarget;
      if (element.scrollHeight > element.clientHeight) {
        element.value = value;
        return;
      }
      onChange(element.value);
    }

    return (
      <div className="relative">
        <div aria-hidden className="pointer-events-none absolute inset-0 flex flex-col">
          {Array.from({ length: SENTENCE_LINES }, (_, line) => (
            <div key={line} className="flex-1 border-b border-line-strong" />
          ))}
        </div>

        {checked ? (
          <p className={cn("relative flex flex-wrap content-start gap-x-3 gap-y-0", LINE_BOX)}>
            {checked.tokens.map((token, index) => (
              <span
                key={`${token}-${index}`}
                className={
                  checked.flagged.has(index)
                    ? "font-semibold text-danger underline decoration-danger decoration-2 underline-offset-4"
                    : "text-ink"
                }
              >
                {token}
              </span>
            ))}
          </p>
        ) : (
          <textarea
            ref={ref}
            value={value}
            onChange={handleChange}
            aria-label={t("sentenceCheckFieldLabel")}
            rows={SENTENCE_LINES}
            // iOS spell-checks against the device's installed keyboard
            // languages, not the page language, so a German keyboard silently
            // rewrites Spanish — and our checker would then flag errors the
            // phone introduced. The app's own check is the only correction
            // surface here.
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="sentences"
            placeholder={t("sentenceCheckPlaceholder")}
            className={cn(
              "relative w-full resize-none overflow-hidden bg-transparent text-ink",
              LINE_BOX,
              "placeholder:text-muted focus-visible:outline-none",
              "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
              "focus-visible:ring-offset-canvas",
            )}
          />
        )}
      </div>
    );
  },
);
