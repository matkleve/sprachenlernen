"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import type { DemonstrationSentencePick } from "@/lib/demonstration-sentence";
import { cn } from "@/lib/utils";

import { copy } from "./content";

export type DemonstrationSentenceProps = {
  pick: DemonstrationSentencePick;
};

/**
 * One checkable sentence on the method menu. Contract:
 * docs/specs/feature/demonstration-sentence.md
 */
export function DemonstrationSentence({ pick }: DemonstrationSentenceProps) {
  const [marked, setMarked] = useState<Set<number>>(() => new Set());
  const [confirmed, setConfirmed] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  function toggleToken(index: number) {
    if (confirmed) return;
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function confirm() {
    if (confirmed) return;
    const count = marked.size;
    setFeedback(
      count === 0 ? copy.demonstrationReadClean : copy.demonstrationMarked(count),
    );
    setConfirmed(true);
  }

  return (
    <section className="mt-6 max-w-2xl" aria-label={copy.demonstrationLabel}>
      <p className="text-sm font-medium text-ink">{copy.demonstrationLabel}</p>
      <p className="mt-3 text-xl leading-relaxed text-ink">
        {pick.tokens.map((token, index) => (
          <Button
            key={`${pick.id}-${index}`}
            type="button"
            variant="ghost"
            size="sm"
            disabled={confirmed}
            onClick={() => toggleToken(index)}
            className={cn(
              "h-auto min-h-0 px-1 py-0.5 text-xl font-normal text-ink hover:bg-surface-raised",
              marked.has(index) && "bg-skill-reading-soft text-ink",
            )}
            aria-pressed={marked.has(index)}
          >
            {token}
          </Button>
        ))}
      </p>
      {feedback ? (
        <p className="mt-3 text-base leading-relaxed text-muted">{feedback}</p>
      ) : (
        <p className="mt-3 text-sm text-muted">{copy.demonstrationHint}</p>
      )}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="mt-4"
        disabled={confirmed}
        onClick={confirm}
      >
        {copy.demonstrationConfirm}
      </Button>
    </section>
  );
}
