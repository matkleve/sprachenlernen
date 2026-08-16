import { getTranslations } from "next-intl/server";

import { SubmitButton } from "@/components/ui/SubmitButton";
import { signInWithOAuthAction } from "@/features/auth/actions";

/** OAuth entry points — contract: docs/specs/service/auth.md */
export async function OAuthButtons() {
  const t = await getTranslations("auth");
  const providers = [
    { id: "google" as const, label: t("oauthGoogle") },
    { id: "apple" as const, label: t("oauthApple") },
  ];

  return (
    <div className="mt-6">
      <p className="text-center text-sm text-muted">{t("oauthDivider")}</p>
      <div className="mt-3 flex flex-col gap-2">
        {providers.map((provider) => (
          <form key={provider.id} action={signInWithOAuthAction}>
            <input type="hidden" name="provider" value={provider.id} />
            <SubmitButton variant="secondary" className="w-full">
              {provider.label}
            </SubmitButton>
          </form>
        ))}
      </div>
    </div>
  );
}
