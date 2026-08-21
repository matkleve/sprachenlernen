"use client";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Field } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Input";
import type { ComfortBand } from "@/lib/coverage";
import type { MaterialSetupPreview } from "@/lib/method-material-setup";

type PreviewLabels = {
  comfortBand: (band: ComfortBand) => string;
  coverageLine: (coveragePercent: number, bandLabel: string) => string;
};

export type OwnMaterialIntakeProps = {
  ownText: string;
  onOwnTextChange: (value: string) => void;
  keepInLibrary: boolean;
  onKeepInLibraryChange: (checked: boolean) => void;
  canPersist: boolean;
  processingConsent: boolean;
  onProcessingConsentChange: (checked: boolean) => void;
  ownPreview: MaterialSetupPreview | null;
  previewLabels: PreviewLabels;
  adaptingLabel: string;
  showAdapting: boolean;
  labels: {
    uploadFile: string;
    pasteText: string;
    pastePlaceholder: string;
    linkUrl: string;
    keepInLibrary: string;
    keepRequiresSignIn: string;
    processingConsent: string;
    processingConsentHint: string;
  };
};

export function OwnMaterialIntake({
  ownText,
  onOwnTextChange,
  keepInLibrary,
  onKeepInLibraryChange,
  canPersist,
  processingConsent,
  onProcessingConsentChange,
  ownPreview,
  previewLabels,
  adaptingLabel,
  showAdapting,
  labels,
}: OwnMaterialIntakeProps) {
  return (
    <div className="space-y-3">
      <div className="hidden flex-wrap gap-2 sm:flex">
        <Button type="button" variant="secondary" size="sm" disabled>
          {labels.uploadFile}
        </Button>
        <span className="self-center text-xs text-muted">{labels.pasteText}</span>
        <Button type="button" variant="secondary" size="sm" disabled>
          {labels.linkUrl}
        </Button>
      </div>
      <Field label={labels.pasteText}>
        <Textarea
          value={ownText}
          onChange={(event) => onOwnTextChange(event.target.value)}
          placeholder={labels.pastePlaceholder}
          rows={4}
        />
      </Field>
      {ownPreview ? (
        <div className="space-y-1 text-sm text-muted">
          <p>
            {ownPreview.unitLabel}
            {" · "}
            {previewLabels.coverageLine(
              ownPreview.coverage.coveragePercent,
              previewLabels.comfortBand(ownPreview.coverage.comfortBand),
            )}
            {ownPreview.timeLabel ? ` · ${ownPreview.timeLabel}` : ""}
          </p>
          {ownPreview.adaptationLabel ? <p>{ownPreview.adaptationLabel}</p> : null}
          {ownPreview.adaptationError ? (
            <p className="text-danger" role="alert">
              {ownPreview.adaptationError}
            </p>
          ) : null}
          {ownPreview.demandingCopy ? <p>{ownPreview.demandingCopy}</p> : null}
          {showAdapting ? <p>{adaptingLabel}</p> : null}
        </div>
      ) : null}
      <div className="space-y-2">
        <Checkbox
          size="sm"
          label={labels.keepInLibrary}
          checked={keepInLibrary}
          disabled={!canPersist}
          title={canPersist ? undefined : labels.keepRequiresSignIn}
          onChange={(event) => onKeepInLibraryChange(event.target.checked)}
        />
        {ownPreview?.needsAdaptation ? (
          <Checkbox
            size="sm"
            label={labels.processingConsent}
            checked={processingConsent}
            title={labels.processingConsentHint}
            onChange={(event) => onProcessingConsentChange(event.target.checked)}
          />
        ) : null}
      </div>
    </div>
  );
}
