"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { TextLink } from "@/components/ui/TextLink";
import { Button } from "@/components/ui/Button";
import { routes } from "@/lib/routes";

const STORAGE_KEY = "sprachenlernen:cookie-consent";

type Consent = "all" | "essential";

/** Contract: docs/specs/feature/privacy-consent.md */
export function CookieConsent() {
  const t = useTranslations("privacy");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!window.localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  const choose = (value: Consent) => {
    window.localStorage.setItem(STORAGE_KEY, value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      className="fixed inset-x-0 bottom-[var(--spacing-shell-float-bottom)] z-40 border-t border-line bg-surface p-4 shadow-raised md:bottom-0"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p id="cookie-consent-title" className="text-sm font-medium text-ink">
            {t("bannerTitle")}
          </p>
          <p className="mt-1 text-sm text-muted">
            {t("bannerBody")}{" "}
            <TextLink href={routes.privacy} size="sm">
              {t("bannerLink")}
            </TextLink>
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => choose("essential")}>
            {t("essentialOnly")}
          </Button>
          <Button type="button" onClick={() => choose("all")}>
            {t("acceptAll")}
          </Button>
        </div>
      </div>
    </div>
  );
}
