import { getTranslations } from "next-intl/server";

import { oauthIconButtonClass } from "@/components/ui/Button";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { signInWithOAuthAction } from "@/features/auth/actions";
import { AppleIcon, GoogleIcon } from "@/features/auth/OAuthProviderIcon";

/** OAuth entry points — contract: docs/specs/service/auth.md */
export async function OAuthButtons() {
  const t = await getTranslations("auth");
  const providers = [
    { id: "google" as const, Icon: GoogleIcon, label: t("oauthGoogleAria") },
    { id: "apple" as const, Icon: AppleIcon, label: t("oauthAppleAria") },
  ];

  return (
    <div className="mt-6">
      <p className="text-center text-sm text-muted">{t("oauthDivider")}</p>
      <div className="mt-3 flex justify-center gap-3">
        {providers.map(({ id, Icon, label }) => (
          <form key={id} action={signInWithOAuthAction}>
            <input type="hidden" name="provider" value={id} />
            <SubmitButton variant="secondary" className={oauthIconButtonClass} aria-label={label}>
              <Icon className={id === "apple" ? "text-ink" : undefined} />
            </SubmitButton>
          </form>
        ))}
      </div>
    </div>
  );
}
