"use client";

import { useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { glossLineForSegments, type ReadableSentenceBlock } from "@/lib/readable-sentences";
import type { ReadableSegment } from "@/lib/readable-text";
import { cn } from "@/lib/utils";

export type ReadableTextProps = {
  sentences: readonly ReadableSentenceBlock[];
};

type ReadableSentenceProps = {
  sentence: ReadableSentenceBlock;
  sentenceIndex: number;
  attemptedSentence: number | null;
  revealedSentence: number | null;
  onSentenceTap: (index: number) => void;
  onWordTap: (segment: ReadableSegment & { kind: "word" }) => void;
  sentenceGlossNote: string;
  sentenceTapAgain: string;
};

function ReadableSentence({
  sentence,
  sentenceIndex,
  attemptedSentence,
  revealedSentence,
  onSentenceTap,
  onWordTap,
  sentenceGlossNote,
  sentenceTapAgain,
}: ReadableSentenceProps) {
  const glossLine = glossLineForSegments(sentence.segments);
  const revealed = revealedSentence === sentenceIndex;

  const handleSentenceKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSentenceTap(sentenceIndex);
    }
  };

  return (
    // Sentence gloss uses a focusable group; word glosses stay on nested Buttons.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- nested word Buttons cannot share role=button
    <div
      role="group"
      tabIndex={0}
      className={cn(
        "mb-3 block rounded-chip px-1 -mx-1 last:mb-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        attemptedSentence === sentenceIndex && !revealed ? "bg-surface-raised" : undefined,
      )}
      onClick={() => onSentenceTap(sentenceIndex)}
      onKeyDown={handleSentenceKeyDown}
    >
      {sentence.segments.map((segment, index) => {
        if (segment.kind === "text") {
          return <span key={`t-${sentenceIndex}-${index}`}>{segment.value}</span>;
        }
        return (
          <Button
            key={`w-${sentenceIndex}-${index}`}
            type="button"
            variant="ghost"
            size="sm"
            onClick={(event) => {
              event.stopPropagation();
              onWordTap(segment);
            }}
            className={cn(
              "h-auto min-h-0 px-0.5 py-0 text-lg font-normal text-ink hover:bg-surface-raised",
            )}
          >
            {segment.text}
          </Button>
        );
      })}
      {revealed && glossLine ? (
        <span className="mt-1 block text-base text-muted">
          <span className="text-ink">{glossLine}</span>
          <span className="mt-0.5 block text-sm">{sentenceGlossNote}</span>
        </span>
      ) : null}
      {attemptedSentence === sentenceIndex && !revealed && glossLine ? (
        <span className="mt-1 block text-sm text-muted">{sentenceTapAgain}</span>
      ) : null}
    </div>
  );
}

/**
 * Tap-to-gloss reading body with second-tap sentence gloss hints.
 * Contract: docs/specs/feature/reading-surface.md
 */
export function ReadableText({ sentences }: ReadableTextProps) {
  const t = useTranslations("contentTrace.reading");
  const [activeWord, setActiveWord] = useState<ReadableSegment & { kind: "word" } | null>(null);
  const [attemptedSentence, setAttemptedSentence] = useState<number | null>(null);
  const [revealedSentence, setRevealedSentence] = useState<number | null>(null);

  const handleSentenceTap = (index: number) => {
    if (revealedSentence === index) return;
    if (attemptedSentence === index) {
      setRevealedSentence(index);
      return;
    }
    setAttemptedSentence(index);
    setRevealedSentence(null);
  };

  return (
    <>
      <div className="text-lg leading-relaxed text-ink">
        {sentences.map((sentence, sentenceIndex) => (
          <ReadableSentence
            key={`sentence-${sentenceIndex}`}
            sentence={sentence}
            sentenceIndex={sentenceIndex}
            attemptedSentence={attemptedSentence}
            revealedSentence={revealedSentence}
            onSentenceTap={handleSentenceTap}
            onWordTap={setActiveWord}
            sentenceGlossNote={t("sentenceGlossNote")}
            sentenceTapAgain={t("sentenceTapAgain")}
          />
        ))}
      </div>

      <Dialog
        open={activeWord !== null}
        onClose={() => setActiveWord(null)}
        title={activeWord?.text ?? ""}
        footer={
          <Button type="button" variant="secondary" size="sm" onClick={() => setActiveWord(null)}>
            {t("close")}
          </Button>
        }
      >
        <p className="text-lg text-muted">{activeWord?.gloss ?? t("noGloss")}</p>
      </Dialog>
    </>
  );
}
