"use server";

import { redirect } from "next/navigation";

import { signIn, signUp } from "@/lib/db/auth";
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

export async function signUpAction(formData: FormData): Promise<void> {
  const { email, password } = readCredentials(formData);
  const result = await signUp(email, password);

  if (result.status === "error") {
    redirect(`${routes.signUp}?error=${encodeURIComponent(result.error)}`);
  }
  if (result.status === "confirmation-required") {
    redirect(`${routes.signUp}?sent=1`);
  }
  redirect(routes.appHome);
}

export async function signInAction(formData: FormData): Promise<void> {
  const { email, password } = readCredentials(formData);
  const result = await signIn(email, password);

  if (result.status === "error") {
    redirect(`${routes.signIn}?error=${encodeURIComponent(result.error)}`);
  }
  redirect(routes.appHome);
}
