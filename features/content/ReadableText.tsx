"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import type { ReadableSegment } from "@/lib/readable-text";
import { cn } from "@/lib/utils";

export type ReadableTextProps = {
  segments: readonly ReadableSegment[];
};

/**
 * Tap-to-gloss reading body. Contract: docs/specs/feature/reading-surface.md
 */
export function ReadableText({ segments }: ReadableTextProps) {
  const t = useTranslations("contentTrace.reading");
  const [active, setActive] = useState<ReadableSegment & { kind: "word" } | null>(null);

  return (
    <>
      <p className="text-lg leading-relaxed text-ink">
        {segments.map((segment, index) => {
          if (segment.kind === "text") {
            return <span key={`t-${index}`}>{segment.value}</span>;
          }
          return (
            <Button
              key={`w-${index}`}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setActive(segment)}
              className={cn(
                "h-auto min-h-0 px-0.5 py-0 text-lg font-normal text-ink hover:bg-surface-raised",
              )}
            >
              {segment.text}
            </Button>
          );
        })}
      </p>

      <Dialog
        open={active !== null}
        onClose={() => setActive(null)}
        title={active?.text ?? ""}
        footer={
          <Button type="button" variant="secondary" size="sm" onClick={() => setActive(null)}>
            {t("close")}
          </Button>
        }
      >
        <p className="text-lg text-muted">
          {active?.gloss ?? t("noGloss")}
        </p>
      </Dialog>
    </>
  );
}
