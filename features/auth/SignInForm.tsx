import { getTranslations } from "next-intl/server";

import { TextLink } from "@/components/ui/TextLink";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { signInAction } from "@/features/auth/actions";
import { OAuthButtons } from "@/features/auth/OAuthButtons";

/** Reuse: Field, Button, Input — see SignUpForm.tsx for the same note. */
export async function SignInForm({ error, referenceId }: { error?: string; referenceId?: string }) {
  const t = await getTranslations("auth");

  return (
    <>
      <form action={signInAction} className="mt-6 flex flex-col gap-4">
        <Field label={t("emailLabel")}>
          <Input type="email" name="email" autoComplete="email" required />
        </Field>
        <Field label={t("passwordLabel")} error={error}>
          <Input type="password" name="password" autoComplete="current-password" required />
        </Field>
        <SubmitButton>{t("signIn.submit")}</SubmitButton>
      </form>
      <OAuthButtons />
      {referenceId ? (
        <p className="mt-3 font-mono text-xs text-muted">Reference: {referenceId}</p>
      ) : null}
      <p className="mt-4 text-sm text-muted">
        {t("signIn.switchPrompt")}{" "}
        <TextLink href="/signup" size="sm">
          {t("signIn.switchLinkLabel")}
        </TextLink>
      </p>
    </>
  );
}
