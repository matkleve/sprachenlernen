"use client";

import { forwardRef, type ChangeEvent } from "react";
import { useTranslations } from "next-intl";

import type { SentenceTokenSpan } from "@/lib/sentence-check";
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
  /** The checked text with its token ranges — present once a check returned. */
  checked: {
    text: string;
    tokens: readonly SentenceTokenSpan[];
    flagged: ReadonlySet<number>;
  } | null;
};

type Segment = { key: string; text: string; flagged: boolean };

/**
 * The checked text, cut into marked words and the untouched characters between
 * them. Built from the original string rather than by joining the words back
 * together, so punctuation, accents and the learner's own spacing come back
 * exactly as typed — a sentence that reads differently after the check makes
 * every mark on it suspect.
 */
function segmentsOf(checked: NonNullable<SentenceLinesProps["checked"]>): Segment[] {
  const segments: Segment[] = [];
  let cursor = 0;

  checked.tokens.forEach((token, index) => {
    if (token.start > cursor) {
      segments.push({
        key: `gap-${cursor}`,
        text: checked.text.slice(cursor, token.start),
        flagged: false,
      });
    }
    segments.push({
      key: `token-${index}`,
      text: checked.text.slice(token.start, token.end),
      flagged: checked.flagged.has(index),
    });
    cursor = token.end;
  });

  if (cursor < checked.text.length) {
    segments.push({ key: `tail-${cursor}`, text: checked.text.slice(cursor), flagged: false });
  }

  return segments;
}

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
          // Extra word-spacing is the "words spread apart" moment: same text,
          // more air between the words so each one can be looked at on its own.
          <p
            className={cn(
              "relative whitespace-pre-wrap break-words text-ink [word-spacing:0.3em]",
              "transition-[word-spacing] duration-200 ease-out-soft",
              LINE_BOX,
            )}
          >
            {segmentsOf(checked).map((segment) => (
              <span
                key={segment.key}
                className={
                  segment.flagged
                    ? "font-semibold text-danger underline decoration-danger decoration-2 underline-offset-4"
                    : undefined
                }
              >
                {segment.text}
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
