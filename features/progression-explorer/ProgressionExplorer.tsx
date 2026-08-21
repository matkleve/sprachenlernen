"use client";

import { useId, useState } from "react";

import { Checkbox } from "@/components/ui/Checkbox";
import { Chip } from "@/components/ui/Chip";
import {
  chapterForStage,
  crossesChapter,
  lampCount,
  MAX_STAGE,
  MIN_STAGE,
  progressionChapters,
  stageDetail,
} from "@/lib/progression-stage";
import { cn } from "@/lib/utils";

import { page } from "./content";
import { ProgressionPreview } from "./ProgressionPreview";

/**
 * Contract: docs/specs/page/progression-explorer.md
 *
 * **Reuse: `Checkbox`, `Chip`** — and everything inside `ProgressionPreview`.
 *
 * **Gap: no range primitive.** `components/ui/` has no slider, and this one
 * stays local rather than becoming `components/ui/Slider.tsx`: it is dev
 * tooling, and a primitive is earned by a second caller, not by anticipating
 * one (AGENTS.md § Where things live). If a learner-facing slider ever ships,
 * it is promoted then. A range input is a native form control, so the
 * DESIGN-SYSTEM exemption for `hover`/`active` applies — `focus-visible` and
 * `disabled` are still implemented, as they are never exempt.
 */
export function ProgressionExplorer() {
  const [stage, setStage] = useState<number>(MIN_STAGE);
  const [lit, setLit] = useState(true);
  const sliderId = useId();

  const chapter = chapterForStage(stage);
  const detail = stageDetail(stage);

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
      <div className="flex flex-col gap-5 lg:w-80 lg:shrink-0">
        <div>
          <label
            htmlFor={sliderId}
            className="flex items-baseline justify-between text-sm font-medium text-ink"
          >
            <span>{page.stageLabel}</span>
            <span className="tabular-nums text-muted">
              {stage} / {MAX_STAGE}
            </span>
          </label>

          <input
            id={sliderId}
            type="range"
            min={MIN_STAGE}
            max={MAX_STAGE}
            step={1}
            value={stage}
            onChange={(event) => setStage(Number(event.target.value))}
            aria-describedby={`${sliderId}-detail`}
            className={cn(
              "mt-3 w-full cursor-pointer accent-accent",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              "focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          />

          <p id={`${sliderId}-detail`} className="mt-2 text-sm text-muted">
            {detail.label} · {lampCount(stage)} {page.lampsUnit}
          </p>
        </div>

        {/* Chapter map — makes the two transitions visible as structure, not surprise. */}
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted">
            {page.chapterHeading}
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {progressionChapters.map((entry) => {
              const current = entry.id === chapter.id;
              return (
                <li key={entry.id}>
                  <div
                    className={cn(
                      "rounded-card border px-3 py-2",
                      current ? "border-accent bg-accent-soft" : "border-line bg-surface",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "font-serif text-sm font-semibold",
                          current ? "text-ink" : "text-muted",
                        )}
                      >
                        {entry.name}
                      </span>
                      <Chip tone={current ? "selected" : "default"}>
                        {entry.stageFrom}–{entry.stageTo}
                      </Chip>
                    </div>
                    <p className="mt-0.5 text-xs text-muted">{entry.tagline}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          {crossesChapter(stage, stage + 1) && stage < MAX_STAGE ? (
            <p className="mt-2 text-xs text-accent">
              Next step crosses into {chapterForStage(stage + 1).name} — the moment.
            </p>
          ) : null}
        </div>

        <div>
          <Checkbox
            checked={lit}
            onChange={(event) => setLit(event.target.checked)}
            label={page.litLabel}
          />
          <p className="mt-1 text-xs text-muted">{page.litHint}</p>
        </div>
      </div>

      <ProgressionPreview stage={stage} lit={lit} className="min-w-0 flex-1" />
    </div>
  );
}
