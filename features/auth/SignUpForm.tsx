import Link from "next/link";

import { SubmitButton } from "@/components/ui/SubmitButton";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { signUpAction } from "@/features/auth/actions";
import { authContent } from "@/features/auth/content";
import { OAuthButtons } from "@/features/auth/OAuthButtons";

/**
 * Reuse: Field, Button, Input (docs/specs/component/field.md, button.md) —
 * no new component. Server Component: the action always redirects, so there
 * is no state to hold client-side.
 */
export function SignUpForm({
  error,
  referenceId,
  sent,
}: {
  error?: string;
  referenceId?: string;
  sent?: boolean;
}) {
  if (sent) {
    return <p className="mt-6 text-sm text-ink">{authContent.signUp.confirmationSent}</p>;
  }

  return (
    <>
      <form action={signUpAction} className="mt-6 flex flex-col gap-4">
        <Field label={authContent.emailLabel}>
          <Input type="email" name="email" autoComplete="email" required />
        </Field>
        <Field
          label={authContent.passwordLabel}
          description={authContent.passwordHint}
          error={error}
        >
          <Input type="password" name="password" autoComplete="new-password" minLength={6} required />
        </Field>
        <SubmitButton>{authContent.signUp.submit}</SubmitButton>
      </form>
      <OAuthButtons />
      {referenceId ? (
        <p className="mt-3 font-mono text-xs text-muted">Reference: {referenceId}</p>
      ) : null}
      <p className="mt-4 text-sm text-muted">
        {authContent.signUp.switchPrompt}{" "}
        <Link className="text-accent underline" href="/login">
          {authContent.signUp.switchLinkLabel}
        </Link>
      </p>
    </>
  );
}
