"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { GRADES, type Grade } from "@/lib/scheduler";

import { copy } from "./content";

type ReviewOpenProps = {
  methodName: string;
};

/**
 * Minimal open session — one card, four grades, no persistence yet (T-B2).
 * Opens immediately; no duration picker.
 */
export function ReviewOpen({ methodName }: ReviewOpenProps) {
  const [lastGrade, setLastGrade] = useState<Grade | null>(null);

  return (
    <div className="mt-page-content">
      <p className="text-sm text-muted">{methodName}</p>

      <div className="mt-6 rounded-card border border-line bg-surface p-8 text-center shadow-soft">
        <p className="text-2xl font-semibold text-ink">{copy.demoCard.front}</p>
        {lastGrade && (
          <p className="mt-4 text-base text-muted">{copy.demoCard.back}</p>
        )}
      </div>

      <p className="mt-6 text-sm text-muted">{copy.prompt}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {GRADES.map((grade) => (
          <Button
            key={grade}
            type="button"
            variant={grade === "again" ? "danger" : "secondary"}
            onClick={() => setLastGrade(grade)}
          >
            {copy[grade]}
          </Button>
        ))}
      </div>

      {lastGrade && (
        <p className="mt-6 text-sm text-muted" aria-live="polite">
          {copy.graded}
        </p>
      )}
    </div>
  );
}
