"use client";

import { useFormatter, useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";

type ListeningDeferNoticeProps = {
  expiry: number;
  onClear: () => void;
};

export function ListeningDeferNotice({ expiry, onClear }: ListeningDeferNoticeProps) {
  const t = useTranslations("listeningDefer");
  const format = useFormatter();

  const resumeTime = format.dateTime(expiry, {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div
      className="mt-4 rounded-card border border-line bg-accent-soft px-4 py-3"
      role="status"
      aria-live="polite"
    >
      <p className="text-sm font-medium text-ink">{t("bannerTitle")}</p>
      <p className="mt-1 text-sm text-muted">{t("bannerBody", { time: resumeTime })}</p>
      <Button type="button" variant="secondary" size="sm" className="mt-3" onClick={onClear}>
        {t("listenAgain")}
      </Button>
    </div>
  );
}
