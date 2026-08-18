"use client";

import { useTranslations } from "next-intl";

type VoiceSubmitStepProps = {
  submitDraft: { audioDataUrl: string | null };
  onAudioChange: (audioDataUrl: string | null) => void;
  config: Record<string, unknown>;
};

export function VoiceSubmitStep({ submitDraft, onAudioChange, config }: VoiceSubmitStepProps) {
  const t = useTranslations("exerciseRunner");
  const required = config.required === true;
  const hint = typeof config.hint === "string" ? config.hint : t("voiceSubmitHint");

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">{hint}</p>
      <div>
        <label className="mb-2 block text-sm font-medium text-ink">
          {t("voiceSubmitLabel")}
          {required ? "" : ` (${t("voiceSubmitOptional")})`}
        </label>
        <input
          type="file"
          accept="audio/*"
          capture="user"
          className="text-sm text-muted"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) {
              onAudioChange(null);
              return;
            }
            onAudioChange(URL.createObjectURL(file));
          }}
        />
        {submitDraft.audioDataUrl ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption -- session-local preview
          <audio src={submitDraft.audioDataUrl} controls className="mt-2 w-full" />
        ) : null}
      </div>
    </div>
  );
}
