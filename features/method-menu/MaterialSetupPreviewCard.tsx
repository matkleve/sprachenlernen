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
};

export function MaterialSetupPreviewCard({
  preview,
  labels,
  viewOriginalLabel,
  sourceUrl,
}: MaterialSetupPreviewCardProps) {
  return (
    <div className="space-y-1 border-t border-line pt-3 text-sm text-muted">
      <p className="font-medium text-ink">{preview.title}</p>
      {preview.attributionText ? (
        <p>
          {preview.attributionText}
          {preview.attributionUrl ? (
            <>
              {" · "}
              <a
                href={preview.attributionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {viewOriginalLabel ?? "View original"}
              </a>
            </>
          ) : null}
        </p>
      ) : null}
      {preview.generatedLabel ? <p>{preview.generatedLabel}</p> : null}
      {preview.adaptationLabel ? <p>{preview.adaptationLabel}</p> : null}
      <p>
        {preview.unitLabel}
        {" · "}
        {labels.coverageLine(
          preview.coverage.coveragePercent,
          labels.comfortBand(preview.coverage.comfortBand),
        )}
        {preview.timeLabel ? ` · ${preview.timeLabel}` : ""}
      </p>
      {sourceUrl && viewOriginalLabel && !preview.attributionUrl ? (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex font-medium text-accent hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {viewOriginalLabel}
        </a>
      ) : null}
      {preview.demandingCopy ? <p>{preview.demandingCopy}</p> : null}
    </div>
  );
}
