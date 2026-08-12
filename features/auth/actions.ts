"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { signIn, signUp, signInWithOAuth, type OAuthProvider } from "@/lib/db/auth";
import { ensureProfileFromAcceptLanguage } from "@/lib/db/profiles";
import { fromAuthError, logHandledError, type HandledError } from "@/lib/errors";
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

function redirectWithHandledError(path: string, handled: HandledError): never {
  logHandledError(handled);
  const params = new URLSearchParams({
    error: handled.userMessage,
    ref: handled.referenceId,
  });
  redirect(`${path}?${params}`);
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
    redirect(`${routes.signUp}?sent=1`);
  }

  const acceptLanguage = (await headers()).get("accept-language");
  await ensureProfileFromAcceptLanguage(acceptLanguage);
  redirect(routes.chooseLanguage);
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
