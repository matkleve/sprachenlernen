"use client";

import { useId } from "react";

import {
  type WoodGrainBlendMode,
  type WoodGrainNoiseType,
  type WoodSurfaceParams,
} from "@/lib/wood-grain";

import { controlLabels, layerLabels, page } from "./content";
import { LabSection, RangeControl } from "./LabControls";

const BLEND_MODES: WoodGrainBlendMode[] = ["multiply", "overlay", "soft-light", "normal"];
const NOISE_TYPES: WoodGrainNoiseType[] = ["fractalNoise", "turbulence"];

type WoodGrainControlsProps = {
  surface: WoodSurfaceParams;
  onGrainChange: (patch: Partial<WoodSurfaceParams["grain"]>) => void;
  onPlankChange: (patch: Partial<WoodSurfaceParams["planks"]>) => void;
  onLightChange: (patch: Partial<WoodSurfaceParams["light"]>) => void;
  onSurfaceChange: (patch: Partial<WoodSurfaceParams>) => void;
  onLayerChange: (layer: keyof WoodSurfaceParams["layers"], enabled: boolean) => void;
};

export function WoodGrainControls({
  surface,
  onGrainChange,
  onPlankChange,
  onLightChange,
  onSurfaceChange,
  onLayerChange,
}: WoodGrainControlsProps) {
  const freqXId = useId();
  const freqYId = useId();
  const octavesId = useId();
  const seedId = useId();
  const svgOpacityId = useId();
  const layerOpacityId = useId();
  const tileWidthId = useId();
  const tileHeightId = useId();
  const contrastId = useId();
  const brightnessId = useId();
  const plankWidthId = useId();
  const seamWidthId = useId();
  const seamOpacityId = useId();
  const vignetteId = useId();
  const highlightId = useId();
  const blendId = useId();
  const noiseId = useId();

  return (
    <>
      <LabSection title={page.layersHeading}>
        {(Object.keys(layerLabels) as Array<keyof WoodSurfaceParams["layers"]>).map((layer) => (
          <label key={layer} className="flex items-center gap-3 text-sm text-ink">
            <input
              type="checkbox"
              checked={surface.layers[layer]}
              onChange={(event) => onLayerChange(layer, event.target.checked)}
              className="size-4 accent-accent"
            />
            {layerLabels[layer]}
          </label>
        ))}
      </LabSection>

      <LabSection title={page.grainHeading}>
        <RangeControl
          id={freqXId}
          label={controlLabels.freqX}
          min={0.005}
          max={1.2}
          step={0.005}
          value={surface.grain.freqX}
          display={surface.grain.freqX.toFixed(3)}
          onChange={(value) => onGrainChange({ freqX: value })}
        />
        <RangeControl
          id={freqYId}
          label={controlLabels.freqY}
          min={0.005}
          max={1.2}
          step={0.005}
          value={surface.grain.freqY}
          display={surface.grain.freqY.toFixed(3)}
          onChange={(value) => onGrainChange({ freqY: value })}
        />
        <RangeControl
          id={octavesId}
          label={controlLabels.numOctaves}
          min={1}
          max={6}
          step={1}
          value={surface.grain.numOctaves}
          display={String(surface.grain.numOctaves)}
          onChange={(value) => onGrainChange({ numOctaves: value })}
        />
        <RangeControl
          id={seedId}
          label={controlLabels.seed}
          min={0}
          max={999}
          step={1}
          value={surface.grain.seed}
          display={String(surface.grain.seed)}
          onChange={(value) => onGrainChange({ seed: value })}
        />
        <RangeControl
          id={svgOpacityId}
          label={controlLabels.svgOpacity}
          min={0.05}
          max={1}
          step={0.01}
          value={surface.grain.svgOpacity}
          display={surface.grain.svgOpacity.toFixed(2)}
          onChange={(value) => onGrainChange({ svgOpacity: value })}
        />
        <RangeControl
          id={layerOpacityId}
          label={controlLabels.layerOpacity}
          min={0}
          max={1}
          step={0.01}
          value={surface.grain.layerOpacity}
          display={surface.grain.layerOpacity.toFixed(2)}
          onChange={(value) => onGrainChange({ layerOpacity: value })}
        />
        <RangeControl
          id={tileWidthId}
          label={controlLabels.tileWidth}
          min={80}
          max={640}
          step={4}
          value={surface.grain.tileWidth}
          display={`${surface.grain.tileWidth}px`}
          onChange={(value) => onGrainChange({ tileWidth: value })}
        />
        <RangeControl
          id={tileHeightId}
          label={controlLabels.tileHeight}
          min={16}
          max={240}
          step={2}
          value={surface.grain.tileHeight}
          display={`${surface.grain.tileHeight}px`}
          onChange={(value) => onGrainChange({ tileHeight: value })}
        />
        <RangeControl
          id={contrastId}
          label={controlLabels.contrast}
          min={0.5}
          max={2.5}
          step={0.05}
          value={surface.grain.contrast}
          display={surface.grain.contrast.toFixed(2)}
          onChange={(value) => onGrainChange({ contrast: value })}
        />
        <RangeControl
          id={brightnessId}
          label={controlLabels.brightness}
          min={0.5}
          max={1.5}
          step={0.05}
          value={surface.grain.brightness}
          display={surface.grain.brightness.toFixed(2)}
          onChange={(value) => onGrainChange({ brightness: value })}
        />

        <label className="text-sm font-medium text-ink" htmlFor={blendId}>
          {controlLabels.blendMode}
        </label>
        <select
          id={blendId}
          value={surface.grain.blendMode}
          onChange={(event) => onGrainChange({ blendMode: event.target.value as WoodGrainBlendMode })}
          className="rounded-card border border-line bg-canvas px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        >
          {BLEND_MODES.map((mode) => (
            <option key={mode} value={mode}>
              {mode}
            </option>
          ))}
        </select>

        <label className="text-sm font-medium text-ink" htmlFor={noiseId}>
          {controlLabels.noiseType}
        </label>
        <select
          id={noiseId}
          value={surface.grain.noiseType}
          onChange={(event) => onGrainChange({ noiseType: event.target.value as WoodGrainNoiseType })}
          className="rounded-card border border-line bg-canvas px-3 py-2 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        >
          {NOISE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </LabSection>

      <LabSection title={page.planksHeading}>
        <RangeControl
          id={plankWidthId}
          label={controlLabels.plankWidth}
          min={48}
          max={140}
          step={2}
          value={surface.planks.plankWidth}
          display={`${surface.planks.plankWidth}px`}
          onChange={(value) => onPlankChange({ plankWidth: value })}
        />
        <RangeControl
          id={seamWidthId}
          label={controlLabels.seamWidth}
          min={0}
          max={6}
          step={1}
          value={surface.planks.seamWidth}
          display={`${surface.planks.seamWidth}px`}
          onChange={(value) => onPlankChange({ seamWidth: value })}
        />
        <RangeControl
          id={seamOpacityId}
          label={controlLabels.seamOpacity}
          min={0}
          max={0.8}
          step={0.01}
          value={surface.planks.seamOpacity}
          display={surface.planks.seamOpacity.toFixed(2)}
          onChange={(value) => onPlankChange({ seamOpacity: value })}
        />
      </LabSection>

      <LabSection title={page.lightHeading}>
        <RangeControl
          id={vignetteId}
          label={controlLabels.vignetteStrength}
          min={0}
          max={0.9}
          step={0.01}
          value={surface.light.vignetteStrength}
          display={surface.light.vignetteStrength.toFixed(2)}
          onChange={(value) => onLightChange({ vignetteStrength: value })}
        />
        <RangeControl
          id={highlightId}
          label={controlLabels.topHighlight}
          min={0}
          max={0.2}
          step={0.01}
          value={surface.light.topHighlight}
          display={surface.light.topHighlight.toFixed(2)}
          onChange={(value) => onLightChange({ topHighlight: value })}
        />
      </LabSection>

      <LabSection title={page.baseHeading}>
        <label className="flex items-center justify-between gap-3 text-sm text-ink">
          <span>{controlLabels.baseTop}</span>
          <input
            type="color"
            value={surface.baseTop}
            onChange={(event) => onSurfaceChange({ baseTop: event.target.value })}
            className="h-9 w-16 cursor-pointer rounded-card border border-line bg-canvas"
          />
        </label>
        <label className="flex items-center justify-between gap-3 text-sm text-ink">
          <span>{controlLabels.baseBottom}</span>
          <input
            type="color"
            value={surface.baseBottom}
            onChange={(event) => onSurfaceChange({ baseBottom: event.target.value })}
            className="h-9 w-16 cursor-pointer rounded-card border border-line bg-canvas"
          />
        </label>
      </LabSection>
    </>
  );
}
