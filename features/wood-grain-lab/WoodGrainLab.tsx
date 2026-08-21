"use client";

import { useMemo, useState } from "react";

import { Chip } from "@/components/ui/Chip";
import {
  buildWoodGrainLayerStyle,
  buildWoodSurfaceStyle,
  DEFAULT_WOOD_SURFACE,
  WOOD_GRAIN_PRESETS,
  woodGrainDirection,
  type WoodLayerVisibility,
  type WoodSurfaceParams,
} from "@/lib/wood-grain";
import { cn } from "@/lib/utils";

import { directionCopy, layerLabels, page } from "./content";
import { LabSection } from "./LabControls";
import { WoodGrainControls } from "./WoodGrainControls";

const SOLO_FLAT = "#6a5848";

export function WoodGrainLab() {
  const [surface, setSurface] = useState<WoodSurfaceParams>(DEFAULT_WOOD_SURFACE);
  const [soloLayer, setSoloLayer] = useState<keyof WoodLayerVisibility | null>(null);

  const direction = woodGrainDirection(surface.grain);
  const exportJson = useMemo(() => JSON.stringify(surface, null, 2), [surface]);

  const previewSurface = useMemo<WoodSurfaceParams>(() => {
    if (!soloLayer) return surface;

    const layers: WoodLayerVisibility = { base: false, planks: false, grain: false, light: false };
    layers[soloLayer] = true;

    return { ...surface, baseTop: SOLO_FLAT, baseBottom: SOLO_FLAT, layers };
  }, [soloLayer, surface]);

  const previewStyle = useMemo(() => buildWoodSurfaceStyle(previewSurface), [previewSurface]);
  const grainLayerStyle = useMemo(() => buildWoodGrainLayerStyle(surface.grain), [surface.grain]);
  const showGrainOverlay =
    surface.layers.grain && (soloLayer === null || soloLayer === "grain");

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-10">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="rounded-card border border-line bg-surface p-4 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-ink">{page.previewLabel}</p>
            <Chip tone={direction === "horizontal" ? "selected" : "default"}>{direction}</Chip>
          </div>
          <p className="mt-2 text-sm text-muted">{directionCopy[direction]}</p>

          <div
            className="relative mt-4 aspect-[5/3] w-full overflow-hidden rounded-card border border-line-strong shadow-raised"
            style={previewStyle}
            data-testid="wood-grain-preview"
          >
            {showGrainOverlay ? (
              <div aria-hidden className="pointer-events-none absolute inset-0" style={grainLayerStyle} />
            ) : null}
          </div>

          <p className="mt-3 text-xs text-muted">{page.soloHint}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(Object.keys(layerLabels) as Array<keyof WoodLayerVisibility>).map((layer) => (
              <button
                key={layer}
                type="button"
                onClick={() => setSoloLayer((current) => (current === layer ? null : layer))}
                className={cn(
                  "rounded-pill border px-3 py-1.5 text-sm font-medium transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
                  soloLayer === layer
                    ? "border-accent bg-accent-soft text-ink"
                    : "border-line bg-canvas text-muted hover:border-line-strong hover:text-ink",
                )}
              >
                Solo {layerLabels[layer]}
              </button>
            ))}
          </div>
        </div>

        <LabSection title={page.exportHeading}>
          <p className="text-sm text-muted">{page.exportHint}</p>
          <pre className="max-h-64 overflow-auto rounded-card border border-line bg-canvas p-3 text-xs text-ink">
            {exportJson}
          </pre>
        </LabSection>
      </div>

      <div className="flex w-full flex-col gap-4 xl:w-[26rem] xl:shrink-0">
        <LabSection title={page.presetsHeading}>
          <div className="flex flex-col gap-2">
            {Object.entries(WOOD_GRAIN_PRESETS).map(([id, preset]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setSurface(preset.surface);
                  setSoloLayer(null);
                }}
                className="rounded-card border border-line bg-canvas px-3 py-2 text-left text-sm text-ink transition hover:border-line-strong hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
              >
                {preset.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setSurface(DEFAULT_WOOD_SURFACE);
                setSoloLayer(null);
              }}
              className="rounded-card border border-line px-3 py-2 text-left text-sm text-muted transition hover:border-line-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            >
              Reset defaults
            </button>
          </div>
        </LabSection>

        <WoodGrainControls
          surface={surface}
          onGrainChange={(patch) => setSurface((current) => ({ ...current, grain: { ...current.grain, ...patch } }))}
          onPlankChange={(patch) =>
            setSurface((current) => ({ ...current, planks: { ...current.planks, ...patch } }))
          }
          onLightChange={(patch) =>
            setSurface((current) => ({ ...current, light: { ...current.light, ...patch } }))
          }
          onSurfaceChange={(patch) => setSurface((current) => ({ ...current, ...patch }))}
          onLayerChange={(layer, enabled) =>
            setSurface((current) => ({
              ...current,
              layers: { ...current.layers, [layer]: enabled },
            }))
          }
        />
      </div>
    </div>
  );
}
