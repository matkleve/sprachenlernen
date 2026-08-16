"use client";

import { useTranslations } from "next-intl";

import { AccountDataPanel } from "@/features/account-data/AccountDataPanel";

/** Your data panel on /profile. Client wrapper so no server markup crosses ProfileSectionNav. */
export function ProfileYourDataSection() {
  const t = useTranslations("accountData");

  return (
    <section>
      <h2 className="text-xl font-semibold text-ink">{t("title")}</h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{t("intro")}</p>
      <AccountDataPanel />
    </section>
  );
}
