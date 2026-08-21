"use client";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Field } from "@/components/ui/Field";
import { Textarea } from "@/components/ui/Input";
import type { MaterialSetupPreview } from "@/lib/method-material-setup";
import { ownMaterialFeelForPreview, type OwnMaterialFeel } from "@/lib/own-material-preview";

export type OwnMaterialIntakeProps = {
  ownText: string;
  onOwnTextChange: (value: string) => void;
  keepInLibrary: boolean;
  onKeepInLibraryChange: (checked: boolean) => void;
  canPersist: boolean;
  processingConsent: boolean;
  onProcessingConsentChange: (checked: boolean) => void;
  ownPreview: MaterialSetupPreview | null;
  ownMaterialCoverage: (coveragePercent: number, feel: OwnMaterialFeel) => string;
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
  ownMaterialCoverage,
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
        <div className="space-y-0.5 text-sm text-muted">
          <p>
            {ownPreview.unitLabel}
            {ownPreview.timeLabel ? ` · ${ownPreview.timeLabel}` : ""}
          </p>
          <p>
            {ownMaterialCoverage(
              ownPreview.coverage.coveragePercent,
              ownMaterialFeelForPreview(ownPreview),
            )}
          </p>
          {ownPreview.adaptationLabel ? <p>{ownPreview.adaptationLabel}</p> : null}
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
