"use client";

import type { MaterialSetupPreview } from "@/lib/method-material-setup";
import type { ComfortBand } from "@/lib/coverage";

type PreviewLabels = {
  comfortBand: (band: ComfortBand) => string;
  coverageLine: (coveragePercent: number, bandLabel: string) => string;
};

export type MaterialSetupPreviewCardProps = {
  preview: MaterialSetupPreview;
  labels: PreviewLabels;
  viewOriginalLabel?: string;
  sourceUrl?: string;
  adaptationError?: string;
  adaptingLabel?: string;
  showAdapting?: boolean;
};

export function MaterialSetupPreviewCard({
  preview,
  labels,
  viewOriginalLabel,
  sourceUrl,
  adaptationError,
  adaptingLabel,
  showAdapting = false,
}: MaterialSetupPreviewCardProps) {
  return (
    <div className="rounded-card border border-line bg-surface-raised p-4 text-sm text-muted">
      <p className="font-medium text-ink">{preview.title}</p>
      {preview.adaptationLabel ? (
        <p className="mt-1 text-muted">{preview.adaptationLabel}</p>
      ) : null}
      <p className="mt-1">
        {preview.unitLabel}
        {" · "}
        {labels.coverageLine(
          preview.coverage.coveragePercent,
          labels.comfortBand(preview.coverage.comfortBand),
        )}
        {preview.timeLabel ? ` · ${preview.timeLabel}` : ""}
      </p>
      {sourceUrl && viewOriginalLabel ? (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex text-sm font-medium text-accent hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {viewOriginalLabel}
        </a>
      ) : null}
      {adaptationError ? (
        <p className="mt-2 text-danger" role="alert">
          {adaptationError}
        </p>
      ) : null}
      {preview.demandingCopy ? (
        <p className="mt-2 text-muted">{preview.demandingCopy}</p>
      ) : null}
      {showAdapting && adaptingLabel ? (
        <p className="mt-2 text-muted">{adaptingLabel}</p>
      ) : null}
    </div>
  );
}
