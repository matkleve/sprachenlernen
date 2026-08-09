import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { signInAction } from "@/features/auth/actions";
import { authContent } from "@/features/auth/content";

/** Reuse: Field, Button, Input — see SignUpForm.tsx for the same note. */
export function SignInForm({ error }: { error?: string }) {
  return (
    <>
      <form action={signInAction} className="mt-6 flex flex-col gap-4">
        <Field label={authContent.emailLabel}>
          <Input type="email" name="email" autoComplete="email" required />
        </Field>
        <Field label={authContent.passwordLabel} error={error}>
          <Input type="password" name="password" autoComplete="current-password" required />
        </Field>
        <Button type="submit">{authContent.signIn.submit}</Button>
      </form>
      <p className="mt-4 text-sm text-muted">
        {authContent.signIn.switchPrompt}{" "}
        <Link className="text-accent underline" href="/signup">
          {authContent.signIn.switchLinkLabel}
        </Link>
      </p>
    </>
  );
}
