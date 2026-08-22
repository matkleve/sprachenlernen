"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { authErrorCodeFor } from "@/lib/auth-error-code";
import {
  resendConfirmation,
  signIn,
  signUp,
  signInWithOAuth,
  type OAuthProvider,
} from "@/lib/db/auth";
import { ensureProfileFromAcceptLanguage, getSpokenLanguage } from "@/lib/db/profiles";
import { fromAuthError, logHandledError, type HandledError } from "@/lib/errors";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "@/lib/i18n/locale-cookie";
import { routes } from "@/lib/routes";

/**
 * Server Actions bound directly to `<form action={...}>` from a Server
 * Component (AGENTS.md boundary 5 — no client-side state for this: the
 * outcome is always a redirect, so nothing here needs "use client").
 * Contract: docs/specs/service/auth.md.
 */

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

/**
 * The URL carries a **code**, never the copy. A message in the query string is
 * a message an attacker can choose, rendered on the real sign-in form — see
 * lib/auth-error-code.ts. `userMessage` still goes to the log, where the
 * audience is us.
 */
function redirectWithHandledError(path: string, handled: HandledError): never {
  logHandledError(handled);
  const params = new URLSearchParams({
    error: authErrorCodeFor(handled),
    ref: handled.referenceId,
  });
  redirect(`${path}?${params}`);
}

/**
 * The "check your email" screen's address, `sent=1` and (on a resend)
 * `resent=1` travel in the URL so the screen can show the address and the
 * resend/wrong-address actions know what it was — `URLSearchParams` encodes
 * it, and `SignUpForm` only ever uses it as a field default value or an
 * action input, never as rendered prose (docs/specs/service/auth.md §
 * Acceptance criteria — the same discipline `redirectWithHandledError`
 * applies to error copy, extended to this value).
 */
function confirmationSentPath(email: string, options: { resent?: boolean } = {}): string {
  const params = new URLSearchParams({ sent: "1", ...(options.resent ? { resent: "1" } : {}) });
  params.set("email", email);
  return `${routes.signUp}?${params}`;
}

async function syncLocaleCookieFromProfile(): Promise<void> {
  const spoken = await getSpokenLanguage();
  if (spoken.status !== "ok") return;

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, spoken.spokenLanguage, {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
  });
}

export async function signUpAction(formData: FormData): Promise<void> {
  const { email, password } = readCredentials(formData);
  const result = await signUp(email, password);

  if (result.status === "error") {
    redirectWithHandledError(
      routes.signUp,
      fromAuthError(result.error, { operation: "create your account" }),
    );
  }
  if (result.status === "confirmation-required") {
    redirect(confirmationSentPath(email));
  }

  const acceptLanguage = (await headers()).get("accept-language");
  await ensureProfileFromAcceptLanguage(acceptLanguage);
  await syncLocaleCookieFromProfile();
  redirect(routes.chooseLanguage);
}

/**
 * Behavior 10: resends the pending signup confirmation to the address on the
 * "check your email" screen. No password — Supabase's resend endpoint needs
 * only the email, and re-asking for a password the visitor already typed once
 * is exactly the friction this action exists to remove.
 */
export async function resendConfirmationAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim();
  const result = await resendConfirmation(email);

  if (result.status === "error") {
    redirectWithHandledError(
      routes.signUp,
      fromAuthError(result.error, { operation: "resend the confirmation email" }),
    );
  }
  redirect(confirmationSentPath(email, { resent: true }));
}

export async function signInAction(formData: FormData): Promise<void> {
  const { email, password } = readCredentials(formData);
  const result = await signIn(email, password);

  if (result.status === "error") {
    redirectWithHandledError(
      routes.signIn,
      fromAuthError(result.error, { operation: "sign you in" }),
    );
  }
  await syncLocaleCookieFromProfile();
  redirect(routes.appHome);
}

export async function signInWithOAuthAction(formData: FormData): Promise<void> {
  const provider = String(formData.get("provider") ?? "") as OAuthProvider;
  if (provider !== "google" && provider !== "apple") {
    redirectWithHandledError(
      routes.signIn,
      fromAuthError("Unknown provider.", { operation: "sign you in" }),
    );
  }

  const result = await signInWithOAuth(provider);
  if (result.status === "error") {
    redirectWithHandledError(
      routes.signIn,
      fromAuthError(result.error, { operation: "sign you in" }),
    );
  }
  redirect(result.url);
}
