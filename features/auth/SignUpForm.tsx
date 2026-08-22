import { getTranslations } from "next-intl/server";

import { TextLink } from "@/components/ui/TextLink";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { resendConfirmationAction, signUpAction } from "@/features/auth/actions";
import { OAuthButtons } from "@/features/auth/OAuthButtons";

/**
 * Reuse: Field, Button, Input, TextLink (docs/specs/component/field.md,
 * button.md) — no new component. Server Component: every action here always
 * redirects, so there is no state to hold client-side.
 */
export async function SignUpForm({
  error,
  referenceId,
  sent,
  resent,
  email,
}: {
  error?: string;
  referenceId?: string;
  sent?: boolean;
  /** The resend redirected back here rather than sending a fresh confirmation address. */
  resent?: boolean;
  /**
   * The address just submitted (`sent`) or one bounced back for correction
   * (`!sent`, from the "wrong address" link). Used only as a field default
   * value and as the resend action's input — never rendered as freeform text.
   * Contract: docs/specs/service/auth.md § Behaviors 10–11.
   */
  email?: string;
}) {
  const t = await getTranslations("auth");

  if (sent) {
    return (
      <div className="mt-6 flex flex-col gap-4">
        <p className="text-sm text-ink">
          {t(resent ? "signUp.confirmationResent" : "signUp.confirmationSent", {
            email: email ?? "",
          })}
        </p>
        <form action={resendConfirmationAction}>
          <input type="hidden" name="email" value={email ?? ""} />
          <SubmitButton variant="secondary" size="sm">
            {t("signUp.resendSubmit")}
          </SubmitButton>
        </form>
        <p className="text-sm text-muted">
          {t("signUp.wrongEmailPrompt")}{" "}
          <TextLink href={`/signup?email=${encodeURIComponent(email ?? "")}`} size="sm">
            {t("signUp.wrongEmailLink")}
          </TextLink>
        </p>
      </div>
    );
  }

  return (
    <>
      <form action={signUpAction} className="mt-6 flex flex-col gap-4">
        <Field label={t("emailLabel")}>
          <Input
            type="email"
            name="email"
            autoComplete="email"
            defaultValue={email}
            required
          />
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
