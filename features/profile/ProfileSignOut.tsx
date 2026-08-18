"use client";

import { useTranslations } from "next-intl";

import { SubmitButton } from "@/components/ui/SubmitButton";
import { signOutAction } from "@/features/app-shell/actions";

/**
 * Sign-out control on /profile. Client form — same pattern as PublicHeaderAuthControls.
 * Contract: docs/specs/page/profile.md
 */
export function ProfileSignOut() {
  const t = useTranslations("profile");

  return (
    <form action={signOutAction} className="mt-page-content">
      <SubmitButton variant="secondary">{t("signOut")}</SubmitButton>
    </form>
  );
}
