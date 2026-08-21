"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import {
  analyzeReferenceImage,
  buildDiffHeatmapImage,
  computeMatchScore,
  GRAIN_ANALYSIS_SIZE,
  type GrainMatchScore,
} from "@/lib/grain-analysis";
import {
  loadReferenceImageData,
  refineParamsTowardReference,
  renderGrainImageData,
} from "@/lib/grain-analysis-render";
import { GRAIN_REFERENCE_FILE, GRAIN_REFERENCE_IMAGE, type GrainParams } from "@/lib/grain-creator";
import { cn } from "@/lib/utils";

import { page } from "./content";
import { GrainPreview } from "./GrainPreview";

type ViewMode = "split" | "overlay" | "diff";

type GrainMatchPanelProps = {
  params: GrainParams;
  onApplyParams: (patch: Partial<GrainParams>) => void;
  onReplaceParams: (params: GrainParams) => void;
};

export function GrainMatchPanel({ params, onApplyParams, onReplaceParams }: GrainMatchPanelProps) {
  const uploadId = useId();
  const compareToken = useRef(0);
  const [referenceSrc, setReferenceSrc] = useState(GRAIN_REFERENCE_IMAGE);
  const [referenceReady, setReferenceReady] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [score, setScore] = useState<GrainMatchScore | null>(null);
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [diffUrl, setDiffUrl] = useState<string | null>(null);

  const referenceMissing = !referenceReady;

  const probeReference = useCallback(async (src: string) => {
    try {
      await loadReferenceImageData(src, GRAIN_ANALYSIS_SIZE);
      setReferenceReady(true);
      setStatusMessage(null);
      return true;
    } catch {
      setReferenceReady(false);
      setScore(null);
      setDiffUrl(null);
      setStatusMessage(page.referenceMissing(GRAIN_REFERENCE_FILE));
      return false;
    }
  }, []);

  useEffect(() => {
    void probeReference(referenceSrc);
  }, [probeReference, referenceSrc]);

  const compareToReference = useCallback(
    async (nextParams: GrainParams, mode: ViewMode) => {
      if (!referenceReady) return;

      const token = ++compareToken.current;
      try {
        const reference = await loadReferenceImageData(referenceSrc, GRAIN_ANALYSIS_SIZE);
        const generated = await renderGrainImageData(nextParams, GRAIN_ANALYSIS_SIZE);
        if (token !== compareToken.current) return;

        setScore(computeMatchScore(reference, generated));

        if (mode === "diff") {
          const heatmap = buildDiffHeatmapImage(reference, generated);
          const canvas = document.createElement("canvas");
          canvas.width = heatmap.width;
          canvas.height = heatmap.height;
          canvas.getContext("2d")?.putImageData(heatmap, 0, 0);
          setDiffUrl(canvas.toDataURL("image/png"));
        }
    } catch {
      if (token !== compareToken.current) return;
      setScore(null);
      setDiffUrl(null);
      setStatusMessage(page.compareFailed);
    }
    },
    [referenceReady, referenceSrc],
  );

  useEffect(() => {
    if (viewMode !== "diff" || !referenceReady) {
      setDiffUrl(null);
      return;
    }

    const timer = window.setTimeout(() => {
      void compareToReference(params, "diff");
    }, 400);

    return () => window.clearTimeout(timer);
  }, [compareToReference, params, referenceReady, viewMode]);

  async function analyzeReference() {
    setBusy(true);
    setStatusMessage(null);
    try {
      const reference = await loadReferenceImageData(referenceSrc, GRAIN_ANALYSIS_SIZE);
      const { suggested } = analyzeReferenceImage(reference);
      onApplyParams(suggested);
      setReferenceReady(true);
      setStatusMessage(page.analyzeDone);
      await compareToReference({ ...params, ...suggested }, viewMode);
    } catch {
      setStatusMessage(page.compareFailed);
    } finally {
      setBusy(false);
    }
  }

  async function autoFit() {
    setBusy(true);
    setStatusMessage(page.autoFitRunning);
    try {
      const reference = await loadReferenceImageData(referenceSrc, GRAIN_ANALYSIS_SIZE);
      const result = await refineParamsTowardReference(reference, params, 24);
      onReplaceParams(result.params);
      setReferenceReady(true);
      setScore(result.score);
      setStatusMessage(page.autoFitDone(result.score.rmse.toFixed(1)));
      if (viewMode === "diff") {
        await compareToReference(result.params, "diff");
      }
    } catch {
      setStatusMessage(page.compareFailed);
    } finally {
      setBusy(false);
    }
  }

  function onUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setReferenceSrc(url);
    setReferenceReady(false);
    setScore(null);
    setDiffUrl(null);
    setStatusMessage(null);
  }

  const viewButtons = useMemo(
    () =>
      [
        { id: "split" as const, label: page.viewSplit },
        { id: "overlay" as const, label: page.viewOverlay },
        { id: "diff" as const, label: page.viewDiff },
      ] as const,
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {viewButtons.map((entry) => (
          <button
            key={entry.id}
            type="button"
            aria-pressed={viewMode === entry.id}
            onClick={() => setViewMode(entry.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition",
              viewMode === entry.id
                ? "border-accent bg-accent-soft text-ink"
                : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
            )}
          >
            {entry.label}
          </button>
        ))}
        <label
          htmlFor={uploadId}
          className="cursor-pointer rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium text-muted transition hover:border-line-strong hover:text-ink"
        >
          {page.uploadReference}
        </label>
        <input id={uploadId} type="file" accept="image/*" className="sr-only" onChange={onUpload} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={busy || referenceMissing}
          onClick={() => void analyzeReference()}
          className={cn(
            "rounded-card border border-line bg-surface px-4 py-2 text-sm font-medium text-ink shadow-soft",
            "transition hover:-translate-y-px hover:border-line-strong hover:shadow-raised",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {page.analyzeReference}
        </button>
        <button
          type="button"
          disabled={busy || referenceMissing}
          onClick={() => void autoFit()}
          className={cn(
            "rounded-card border border-line bg-surface px-4 py-2 text-sm font-medium text-ink shadow-soft",
            "transition hover:-translate-y-px hover:border-line-strong hover:shadow-raised",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {page.autoFit}
        </button>
        {score ? (
          <p className="text-sm text-muted">{page.scoreLabel(score.rmse.toFixed(1))}</p>
        ) : null}
      </div>

      {statusMessage ? (
        <p className="text-sm text-muted" role="status">
          {statusMessage}
        </p>
      ) : null}

      {viewMode === "split" ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <ReferencePanel referenceSrc={referenceSrc} referenceMissing={referenceMissing} />
          <GeneratedPanel params={params} />
        </div>
      ) : null}

      {viewMode === "overlay" ? (
        <div className="relative isolate min-h-72 overflow-hidden rounded-card border border-line shadow-soft">
          {!referenceMissing ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={referenceSrc} alt={page.referenceAlt} className="absolute inset-0 size-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-surface-raised" aria-hidden />
          )}
          <div className="absolute inset-0 opacity-55 mix-blend-multiply">
            <GrainPreview params={params} className="absolute inset-0" />
          </div>
        </div>
      ) : null}

      {viewMode === "diff" ? (
        diffUrl ? (
          <figure className="flex flex-col gap-2">
            <figcaption className="text-xs font-medium uppercase tracking-widest text-muted">
              {page.diffHeading}
            </figcaption>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={diffUrl} alt={page.diffAlt} className="min-h-72 rounded-card border border-line object-cover" />
          </figure>
        ) : (
          <p className="min-h-72 rounded-card border border-line bg-surface-raised p-6 text-center text-sm text-muted">
            {referenceMissing ? page.referenceMissing(GRAIN_REFERENCE_FILE) : page.diffPending}
          </p>
        )
      ) : null}
    </div>
  );
}

function ReferencePanel({
  referenceSrc,
  referenceMissing,
}: {
  referenceSrc: string;
  referenceMissing: boolean;
}) {
  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="text-xs font-medium uppercase tracking-widest text-muted">
        {page.referenceHeading}
      </figcaption>
      <div
        className={cn(
          "relative isolate min-h-72 overflow-hidden rounded-card border border-line shadow-soft",
          referenceMissing && "bg-surface-raised",
        )}
      >
        {referenceMissing ? (
          <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-muted">
            {page.referenceMissing(GRAIN_REFERENCE_FILE)}
          </p>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={referenceSrc} alt={page.referenceAlt} className="size-full object-cover object-left-top" />
        )}
      </div>
    </figure>
  );
}

function GeneratedPanel({ params }: { params: GrainParams }) {
  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="text-xs font-medium uppercase tracking-widest text-muted">
        {page.generatedHeading}
      </figcaption>
      <div
        className="relative isolate min-h-72 overflow-hidden rounded-card border border-line shadow-soft"
        aria-label={page.previewHeading}
      >
        <GrainPreview params={params} className="absolute inset-0" />
      </div>
    </figure>
  );
}
