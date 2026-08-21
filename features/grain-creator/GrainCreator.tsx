"use client";

import { useMemo, useState } from "react";

import {
  buildGrainCssSnippet,
  DEFAULT_GRAIN_PARAMS,
  GRAIN_PRESETS,
  grainRepeatWidthPx,
  type GrainParams,
  type GrainPresetId,
} from "@/lib/grain-creator";
import { cn } from "@/lib/utils";

import { page } from "./content";
import { GrainControls } from "./GrainControls";
import { GrainPreview } from "./GrainPreview";

/**
 * Contract: docs/specs/page/grain-creator.md
 *
 * Dev-only — no `components/ui/Slider`; same exemption as progression explorer.
 */
export function GrainCreator() {
  const [params, setParams] = useState<GrainParams>(DEFAULT_GRAIN_PARAMS);
  const [activePreset, setActivePreset] = useState<GrainPresetId | null>("raw-planks");
  const [copied, setCopied] = useState(false);

  const repeatWidth = grainRepeatWidthPx(params);
  const cssSnippet = useMemo(() => buildGrainCssSnippet(params), [params]);

  function patchParams(patch: Partial<GrainParams>) {
    setParams((current) => ({ ...current, ...patch }));
    setActivePreset(null);
  }

  function applyPreset(presetId: GrainPresetId) {
    setParams(GRAIN_PRESETS[presetId]);
    setActivePreset(presetId);
  }

  async function copyCss() {
    await navigator.clipboard.writeText(cssSnippet);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-10">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div>
          <h2 className="font-serif text-xl font-semibold text-ink">{page.previewHeading}</h2>
          <p className="mt-1 text-sm text-muted">{page.repeatNote(repeatWidth)}</p>
        </div>
        <GrainPreview params={params} />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void copyCss()}
            className={cn(
              "rounded-card border border-line bg-surface px-4 py-2 text-sm font-medium text-ink shadow-soft",
              "transition hover:-translate-y-px hover:border-line-strong hover:shadow-raised",
              "active:translate-y-0 active:scale-[0.99]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            {copied ? page.copiedLabel : page.copyLabel}
          </button>
          <button
            type="button"
            onClick={() => applyPreset("raw-planks")}
            className={cn(
              "rounded-card border border-line bg-surface px-4 py-2 text-sm font-medium text-muted shadow-soft",
              "transition hover:-translate-y-px hover:border-line-strong hover:text-ink hover:shadow-raised",
              "active:translate-y-0 active:scale-[0.99]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
            )}
          >
            {page.resetLabel}
          </button>
        </div>
        <pre className="max-h-48 overflow-auto rounded-card border border-line bg-surface-raised p-4 text-xs text-muted">
          <code>{cssSnippet}</code>
        </pre>
      </div>

      <GrainControls
        params={params}
        activePreset={activePreset}
        onPatch={patchParams}
        onPreset={applyPreset}
      />
    </div>
  );
}
