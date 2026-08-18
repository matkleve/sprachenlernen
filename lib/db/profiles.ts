import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";

import { getAccount } from "@/lib/db/auth";
import { createServerSupabaseClient } from "@/lib/db/client";
import {
  fromSupabaseLanguageError,
  languageNotSignedIn,
  logHandledErrorFromRequest,
} from "@/lib/errors";
import {
  DEFAULT_SPOKEN_LANGUAGE,
  isSpokenLanguageShipped,
  resolveSpokenLanguageFromAcceptLanguage,
} from "@/lib/spoken-language";

/**
 * Account profile adapter — spoken language (UC-069). Contract:
 * docs/specs/service/spoken-language.md
 */

export type SpokenLanguageOutcome =
  | { status: "ok"; spokenLanguage: string }
  | { status: "error"; error: string };

export type MutateSpokenLanguageOutcome =
  | { status: "ok" }
  | { status: "error"; error: string };

type ProfileRow = {
  spoken_language: string;
};

type DbError = { message: string; code?: string };

async function resolveClient(client?: SupabaseClient): Promise<SupabaseClient> {
  return client ?? (await createServerSupabaseClient());
}

async function readRow(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ row: ProfileRow | null; error: DbError | null }> {
  const { data, error } = await supabase
    .from("profiles")
    .select("spoken_language")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return { row: null, error };
  return { row: data, error: null };
}

/**
 * Inserts a profile row when missing. Idempotent — safe to call on every
 * first sign-in path (email, OAuth, confirmation callback).
 */
export async function ensureProfile(
  spokenLanguage: string = DEFAULT_SPOKEN_LANGUAGE,
  client?: SupabaseClient,
): Promise<MutateSpokenLanguageOutcome> {
  const supabase = await resolveClient(client);
  const account = await getAccount(supabase);
  if (!account) {
    const handled = languageNotSignedIn({ operation: "save your language preference" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  const language = isSpokenLanguageShipped(spokenLanguage)
    ? spokenLanguage
    : DEFAULT_SPOKEN_LANGUAGE;

  const existing = await readRow(supabase, account.id);
  if (existing.error) {
    const handled = fromSupabaseLanguageError(existing.error, {
      operation: "save your language preference",
    });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  if (existing.row) return { status: "ok" };

  const { error } = await supabase.from("profiles").insert({
    user_id: account.id,
    spoken_language: language,
  });

  if (error) {
    const handled = fromSupabaseLanguageError(error, {
      operation: "save your language preference",
    });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  return { status: "ok" };
}

/** Seeds from the request's Accept-Language — call at signup / auth callback. */
export async function ensureProfileFromAcceptLanguage(
  acceptLanguage: string | null | undefined,
  client?: SupabaseClient,
): Promise<MutateSpokenLanguageOutcome> {
  return ensureProfile(resolveSpokenLanguageFromAcceptLanguage(acceptLanguage), client);
}

export async function getSpokenLanguage(
  client?: SupabaseClient,
): Promise<SpokenLanguageOutcome> {
  return getSpokenLanguageCached(client);
}

async function getSpokenLanguageImpl(
  client?: SupabaseClient,
): Promise<SpokenLanguageOutcome> {
  const supabase = await resolveClient(client);
  const account = await getAccount(supabase);
  if (!account) {
    const handled = languageNotSignedIn({ operation: "load your language preference" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  const existing = await readRow(supabase, account.id);
  if (existing.error) {
    const handled = fromSupabaseLanguageError(existing.error, {
      operation: "load your language preference",
    });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  if (existing.row) {
    return { status: "ok", spokenLanguage: existing.row.spoken_language };
  }

  const seeded = await ensureProfile(DEFAULT_SPOKEN_LANGUAGE, supabase);
  if (seeded.status === "error") return seeded;
  return { status: "ok", spokenLanguage: DEFAULT_SPOKEN_LANGUAGE };
}

const getSpokenLanguageCached = cache(getSpokenLanguageImpl);

export async function setSpokenLanguage(
  spokenLanguage: string,
  client?: SupabaseClient,
): Promise<MutateSpokenLanguageOutcome> {
  const supabase = await resolveClient(client);
  const account = await getAccount(supabase);
  if (!account) {
    const handled = languageNotSignedIn({ operation: "change your language preference" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  if (!isSpokenLanguageShipped(spokenLanguage)) {
    return { status: "error", error: "That language is not available yet." };
  }

  const existing = await readRow(supabase, account.id);
  if (existing.error) {
    const handled = fromSupabaseLanguageError(existing.error, {
      operation: "change your language preference",
    });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  if (!existing.row) {
    const { error } = await supabase.from("profiles").insert({
      user_id: account.id,
      spoken_language: spokenLanguage,
    });
    if (error) {
      const handled = fromSupabaseLanguageError(error, {
        operation: "change your language preference",
      });
      void logHandledErrorFromRequest(handled);
      return { status: "error", error: handled.userMessage };
    }
    return { status: "ok" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ spoken_language: spokenLanguage, updated_at: new Date().toISOString() })
    .eq("user_id", account.id);

  if (error) {
    const handled = fromSupabaseLanguageError(error, {
      operation: "change your language preference",
    });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  return { status: "ok" };
}
