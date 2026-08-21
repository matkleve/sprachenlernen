import {
  materialChapters,
  materialRecipes,
  materialRecipeForStage,
} from "@/lib/material-recipes";

import { page } from "./content";
import { MaterialKnobBar } from "./MaterialKnobBar";
import { MaterialSample } from "./MaterialSample";

const WORKSHOP_STAGES = [1, 2, 3] as const;

const KNOB_KEYS = ["grain", "roughness", "specular", "radius"] as const;

type KnobKey = (typeof KNOB_KEYS)[number];

function knobValue(stage: number, key: KnobKey): number {
  const recipe = materialRecipeForStage(stage);
  if (key === "radius") return recipe.radius / 24;
  return recipe[key];
}

/**
 * Rough → fine guide: knob deltas and all nine stages grouped by chapter.
 * Contract: docs/specs/page/material-explorer.md
 */
export function MaterialProgressionGuide() {
  const { progression } = page;

  return (
    <div className="flex flex-col gap-12">
      <section className="rounded-card border border-line bg-surface p-6">
        <h2 className="font-serif text-xl font-semibold text-ink">{progression.insightHeading}</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted">{progression.insightBody}</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {WORKSHOP_STAGES.map((stage) => {
            const recipe = materialRecipeForStage(stage);
            return (
              <div key={stage} className="flex flex-col gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-muted">
                    Stage {stage}
                  </p>
                  <p className="mt-1 font-serif text-base font-semibold text-ink">{recipe.name}</p>
                  <p className="mt-0.5 text-xs text-muted">{recipe.texture}</p>
                </div>

                <div className="flex flex-col gap-3">
                  <MaterialKnobBar
                    label={page.recipeRows.grain}
                    value={recipe.grain}
                    hint={stage === 1 ? progression.grainHintRough : stage === 3 ? progression.grainHintFine : undefined}
                  />
                  <MaterialKnobBar
                    label={page.recipeRows.roughness}
                    value={recipe.roughness}
                  />
                  <MaterialKnobBar
                    label={page.recipeRows.specular}
                    value={recipe.specular}
                    hint={stage === 3 ? progression.specularHintFine : undefined}
                  />
                  <MaterialKnobBar
                    label={page.recipeRows.radius}
                    value={recipe.radius}
                    max={24}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-sm text-muted">{progression.knobSummary}</p>
      </section>

      {materialChapters.map((chapter) => {
        const stages = materialRecipes.filter(
          (recipe) => recipe.stage >= chapter.stageFrom && recipe.stage <= chapter.stageTo,
        );

        return (
          <section key={chapter.id}>
            <h2 className="font-serif text-xl font-semibold text-ink">{chapter.name}</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted">
              {chapter.tagline} · stages {chapter.stageFrom}–{chapter.stageTo}
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {stages.map((recipe) => (
                <div key={recipe.stage} className="flex flex-col gap-3">
                  <MaterialSample stage={recipe.stage} compact />
                  <div className="grid grid-cols-2 gap-2 px-1">
                    {KNOB_KEYS.map((key) => (
                      <MaterialKnobBar
                        key={key}
                        label={page.recipeRows[key]}
                        value={knobValue(recipe.stage, key)}
                        max={key === "radius" ? 1 : undefined}
                        className="text-[0.65rem]"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
