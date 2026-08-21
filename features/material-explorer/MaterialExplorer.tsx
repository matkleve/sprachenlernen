"use client";

import { useId, useState } from "react";

import { Chip } from "@/components/ui/Chip";
import {
  chapterForMaterialStage,
  materialChapters,
  MAX_MATERIAL_STAGE,
  materialRecipeForStage,
  MIN_MATERIAL_STAGE,
} from "@/lib/material-recipes";
import { cn } from "@/lib/utils";

import { page } from "./content";
import { MaterialProgressionGuide } from "./MaterialProgressionGuide";
import { MaterialRecipeTable } from "./MaterialRecipeTable";
import { MaterialSample } from "./MaterialSample";

/**
 * Contract: docs/specs/page/material-explorer.md
 *
 * **Reuse: `Chip`** — stage/chapter labels only. Material primitives are
 * dev-only (`.material-card`, `.material-input`, `.material-button`).
 */
export function MaterialExplorer() {
  const [stage, setStage] = useState<number>(MIN_MATERIAL_STAGE);
  const sliderId = useId();

  const chapter = chapterForMaterialStage(stage);
  const recipe = materialRecipeForStage(stage);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
        <div className="flex flex-col gap-5 lg:w-80 lg:shrink-0">
          <div>
            <label
              htmlFor={sliderId}
              className="flex items-baseline justify-between text-sm font-medium text-ink"
            >
              <span>{page.stageLabel}</span>
              <span className="tabular-nums text-muted">
                {stage} / {MAX_MATERIAL_STAGE}
              </span>
            </label>

            <input
              id={sliderId}
              type="range"
              min={MIN_MATERIAL_STAGE}
              max={MAX_MATERIAL_STAGE}
              step={1}
              value={stage}
              onChange={(event) => setStage(Number(event.target.value))}
              className={cn(
                "mt-3 w-full cursor-pointer accent-accent",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                "focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
                "disabled:cursor-not-allowed disabled:opacity-50",
              )}
            />

            <p className="mt-2 text-sm text-muted">{recipe.name}</p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted">
              {page.chapterHeading}
            </p>
            <ul className="mt-2 flex flex-col gap-1">
              {materialChapters.map((entry) => {
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
          </div>

          <MaterialRecipeTable recipe={recipe} />

          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted">
              {page.stackHeading}
            </p>
            <ol className="mt-2 flex flex-col gap-1 text-sm text-muted">
              {page.stackLayers.map((layer, index) => (
                <li key={layer} className="flex items-center gap-2">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-raised text-xs font-medium text-ink">
                    {index + 1}
                  </span>
                  {layer}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <MaterialSample stage={stage} className="min-w-0 flex-1" />
      </div>

      <section>
        <h2 className="font-serif text-xl font-semibold text-ink">{page.workshopHeading}</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">{page.workshopIntro}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((workshopStage) => (
            <MaterialSample key={workshopStage} stage={workshopStage} compact />
          ))}
        </div>
      </section>

      <MaterialProgressionGuide />
    </div>
  );
}
