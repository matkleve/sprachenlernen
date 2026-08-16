import { getTranslations } from "next-intl/server";

import { TextLink } from "@/components/ui/TextLink";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { signUpAction } from "@/features/auth/actions";
import { OAuthButtons } from "@/features/auth/OAuthButtons";

/**
 * Reuse: Field, Button, Input (docs/specs/component/field.md, button.md) —
 * no new component. Server Component: the action always redirects, so there
 * is no state to hold client-side.
 */
export async function SignUpForm({
  error,
  referenceId,
  sent,
}: {
  error?: string;
  referenceId?: string;
  sent?: boolean;
}) {
  const t = await getTranslations("auth");

  if (sent) {
    return <p className="mt-6 text-sm text-ink">{t("signUp.confirmationSent")}</p>;
  }

  return (
    <>
      <form action={signUpAction} className="mt-6 flex flex-col gap-4">
        <Field label={t("emailLabel")}>
          <Input type="email" name="email" autoComplete="email" required />
        </Field>
        <Field
          label={t("passwordLabel")}
          description={t("passwordHint")}
          error={error}
        >
          <Input type="password" name="password" autoComplete="new-password" minLength={6} required />
        </Field>
        <SubmitButton>{t("signUp.submit")}</SubmitButton>
      </form>
      <OAuthButtons />
      {referenceId ? (
        <p className="mt-3 font-mono text-xs text-muted">Reference: {referenceId}</p>
      ) : null}
      <p className="mt-4 text-sm text-muted">
        {t("signUp.switchPrompt")}{" "}
        <TextLink href="/login" size="sm">
          {t("signUp.switchLinkLabel")}
        </TextLink>
      </p>
    </>
  );
}
