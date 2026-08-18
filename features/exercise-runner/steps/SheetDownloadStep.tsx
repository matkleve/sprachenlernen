"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";

type SheetDownloadStepProps = {
  config: Record<string, unknown>;
};

export function SheetDownloadStep({ config }: SheetDownloadStepProps) {
  const t = useTranslations("exerciseRunner");
  const title = typeof config.title === "string" ? config.title : t("sheetDefaultTitle");
  const lineCount = typeof config.lineCount === "number" ? config.lineCount : 6;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <p className="text-base text-ink">{t("sheetDownloadIntro")}</p>
      <div
        className="rounded-card border border-line bg-surface p-4 print:border-0 print:p-0"
        aria-label={t("sheetPreviewLabel")}
      >
        <p className="font-medium text-ink">{title}</p>
        <ol className="mt-4 list-decimal space-y-6 pl-5 text-muted">
          {Array.from({ length: lineCount }, (_, index) => (
            <li key={index} className="min-h-8 border-b border-line pb-2 print:min-h-12">
              <span className="sr-only">{t("sheetLine", { number: index + 1 })}</span>
            </li>
          ))}
        </ol>
      </div>
      <Button type="button" variant="secondary" size="sm" onClick={handlePrint}>
        {t("sheetPrint")}
      </Button>
    </div>
  );
}
