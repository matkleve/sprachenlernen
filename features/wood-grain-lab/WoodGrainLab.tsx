"use client";

import { useState } from "react";

import { Chip } from "@/components/ui/Chip";
import { ProceduralWoodBackground } from "@/features/material-explorer/ProceduralWoodBackground";
import {
  PROCEDURAL_WOOD_PRESETS,
  type ProceduralWoodPresetId,
} from "@/lib/procedural-wood";
import { cn } from "@/lib/utils";

import { page } from "./content";
import { LabSection } from "./LabControls";

const PRESET_LABELS: Record<ProceduralWoodPresetId, string> = {
  "workshop-1-raw": "Workshop 1 — raw",
  "workshop-2-sanded": "Workshop 2 — sanded",
  "workshop-3-oiled": "Workshop 3 — oiled",
};

export function WoodGrainLab() {
  const [preset, setPreset] = useState<ProceduralWoodPresetId>("workshop-1-raw");
  const params = PROCEDURAL_WOOD_PRESETS[preset];

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-10">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="rounded-card border border-line bg-surface p-4 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-ink">{page.previewLabel}</p>
            <Chip tone="selected">horizontal</Chip>
          </div>
          <p className="mt-2 text-sm text-muted">{page.proceduralNote}</p>

          <div
            className="relative mt-4 aspect-[5/3] w-full overflow-hidden rounded-card border border-line-strong shadow-raised"
            data-testid="wood-grain-preview"
          >
            <ProceduralWoodBackground
              preset={preset}
              vignette={preset === "workshop-1-raw" ? 0.3 : preset === "workshop-2-sanded" ? 0.18 : 0.08}
              topHighlight={preset === "workshop-3-oiled" ? 0.12 : 0}
            />
          </div>
        </div>

        <LabSection title={page.paramsHeading}>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <dt className="text-muted">Ring contrast</dt>
              <dd className="tabular-nums text-ink">{params.ringContrast.toFixed(2)}</dd>
            </div>
            <div>
              <dt className="text-muted">Grain contrast</dt>
              <dd className="tabular-nums text-ink">{params.grainContrast.toFixed(2)}</dd>
            </div>
            <div>
              <dt className="text-muted">Polish</dt>
              <dd className="tabular-nums text-ink">{params.polish.toFixed(2)}</dd>
            </div>
            <div>
              <dt className="text-muted">Warp</dt>
              <dd className="tabular-nums text-ink">{params.warpStrength.toFixed(2)}</dd>
            </div>
          </dl>
        </LabSection>
      </div>

      <div className="flex w-full flex-col gap-4 xl:w-[26rem] xl:shrink-0">
        <LabSection title={page.presetsHeading}>
          <div className="flex flex-col gap-2">
            {(Object.keys(PRESET_LABELS) as ProceduralWoodPresetId[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setPreset(id)}
                className={cn(
                  "rounded-card border px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
                  preset === id
                    ? "border-accent bg-accent-soft text-ink"
                    : "border-line bg-canvas text-ink hover:border-line-strong hover:shadow-soft",
                )}
              >
                {PRESET_LABELS[id]}
              </button>
            ))}
          </div>
        </LabSection>
      </div>
    </div>
  );
}
