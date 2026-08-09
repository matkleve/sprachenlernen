import type { SupabaseClient } from "@supabase/supabase-js";

import { createServerSupabaseClient } from "@/lib/db/client";
import { routes } from "@/lib/routes";
import { getSiteUrl } from "@/lib/site-url";

/**
 * The auth adapter. Contract: docs/specs/service/auth.md
 *
 * Every function optionally takes a client so callers (and tests) can inject
 * one — the default creates a fresh per-request server client via
 * `lib/db/client.ts`. Nothing here reaches `@supabase/*` through any other
 * path (BACKEND.md §3).
 *
 * Outcomes are one discriminated union per function, not a pile of booleans
 * (docs/STATE.md §2) — "signed in with a session" and "signed up but must
 * confirm by email" are different states, not the same success with a flag.
 */

export type Account = { id: string; email: string };

export type SignUpOutcome =
  | { status: "signed-in"; account: Account }
  | { status: "confirmation-required"; account: Account }
  | { status: "error"; error: string };

export type SignInOutcome =
  | { status: "signed-in"; account: Account }
  | { status: "error"; error: string };

export type SignOutOutcome = { status: "signed-out" } | { status: "error"; error: string };

async function resolveClient(client?: SupabaseClient): Promise<SupabaseClient> {
  return client ?? (await createServerSupabaseClient());
}

/**
 * Creates the account. Supabase's own anti-enumeration behaviour (an
 * "already registered" email returns a success-shaped, session-less user
 * rather than an error) is passed through rather than re-implemented — see
 * https://supabase.com/docs/guides/auth/passwords.
 *
 * Whether this project's project settings should turn *off* mandatory email
 * confirmation is a product decision this function does not make — see
 * docs/specs/service/auth.md § Open questions. Both outcomes are handled
 * here regardless of which way that is decided.
 */
export async function signUp(
  email: string,
  password: string,
  client?: SupabaseClient,
): Promise<SignUpOutcome> {
  const supabase = await resolveClient(client);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getSiteUrl()}${routes.authCallback}`,
    },
  });

  if (error || !data.user) {
    return { status: "error", error: error?.message ?? "Could not create an account." };
  }

  const account: Account = { id: data.user.id, email: data.user.email ?? email };
  return data.session
    ? { status: "signed-in", account }
    : { status: "confirmation-required", account };
}

export async function signIn(
  email: string,
  password: string,
  client?: SupabaseClient,
): Promise<SignInOutcome> {
  const supabase = await resolveClient(client);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { status: "error", error: error?.message ?? "Could not sign in." };
  }

  return { status: "signed-in", account: { id: data.user.id, email: data.user.email ?? email } };
}

export async function signOut(client?: SupabaseClient): Promise<SignOutOutcome> {
  const supabase = await resolveClient(client);
  const { error } = await supabase.auth.signOut();
  return error ? { status: "error", error: error.message } : { status: "signed-out" };
}

/** The signed-in Account for this request, or null. Never throws on "signed out". */
export async function getAccount(client?: SupabaseClient): Promise<Account | null> {
  const supabase = await resolveClient(client);
  const { data } = await supabase.auth.getUser();
  return data.user ? { id: data.user.id, email: data.user.email ?? "" } : null;
}
