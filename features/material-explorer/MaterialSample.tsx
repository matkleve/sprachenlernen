"use client";

import {
  materialRecipeForStage,
  materialStageClass,
  materialStageStyle,
} from "@/lib/material-recipes";
import { proceduralWoodPresetForStage } from "@/lib/procedural-wood";
import { cn } from "@/lib/utils";

import { page } from "./content";
import { MaterialStarField } from "./MaterialStarField";
import { ProceduralWoodBackground } from "./ProceduralWoodBackground";

type MaterialSampleProps = {
  stage: number;
  compact?: boolean;
  className?: string;
};

/**
 * One card + one input + one button — identical geometry, material layer only.
 * Contract: docs/specs/page/material-explorer.md
 */
export function MaterialSample({ stage, compact = false, className }: MaterialSampleProps) {
  const recipe = materialRecipeForStage(stage);
  const woodPreset = proceduralWoodPresetForStage(stage);
  const { preview } = page;

  return (
    <div
      className={cn(
        "material-system material-scene border border-line",
        materialStageClass(stage),
        woodPreset ? "material-scene--procedural-wood" : null,
        compact ? "p-4" : "p-6",
        className,
      )}
      style={materialStageStyle(stage)}
    >
      {woodPreset ? (
        <ProceduralWoodBackground
          preset={woodPreset}
          vignette={stage === 1 ? 0.35 : stage === 2 ? 0.2 : 0.1}
          topHighlight={stage === 3 ? 0.12 : stage === 2 ? 0.06 : 0}
        />
      ) : null}
      <MaterialStarField stage={stage} />

      <div className={cn("relative z-[1] flex flex-col", compact ? "gap-3" : "gap-4")}>
        <div className={cn("material-card", compact ? "p-3" : "p-4")}>
          <h3
            className={cn(
              "font-serif font-semibold",
              compact ? "text-sm" : "text-base",
            )}
            style={{ color: "var(--material-ink)" }}
          >
            {preview.cardTitle}
          </h3>
          <p
            className={cn("mt-1", compact ? "text-xs" : "text-sm")}
            style={{ color: "var(--material-muted)" }}
          >
            {preview.cardBody}
          </p>
        </div>

        <input
          type="text"
          readOnly
          tabIndex={-1}
          placeholder={preview.inputPlaceholder}
          className="material-input"
          aria-label={preview.inputPlaceholder}
        />

        <button type="button" tabIndex={-1} className="material-button self-start">
          {preview.buttonLabel}
        </button>
      </div>

      {compact ? (
        <p className="mt-3 text-center text-xs text-muted">
          Stage {recipe.stage} · {recipe.name}
        </p>
      ) : null}
    </div>
  );
}
