import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";

import { getAccount } from "@/lib/db/auth";
import { createServerSupabaseClient } from "@/lib/db/client";
import {
  fromSupabaseLanguageError,
  languageNotSignedIn,
  logHandledErrorFromRequest,
} from "@/lib/errors";
import { availableLanguages, isLanguageAvailable } from "@/lib/starter-deck";

/**
 * Learning-language adapter. Contract:
 * docs/specs/service/learning-languages.md
 *
 * A **learning language** is one this Account is learning; there may be
 * several. The **active** language is the one the interface is showing; there
 * is exactly one, and it decides both what is displayed and what a session
 * schedules (UC-025, corrected 2026-08-12 — languages never share a session,
 * so there is no longer a reason for those two to differ).
 *
 * ⚠ Nothing here may be imported by `lib/session-builder.ts` — that module
 * stays a pure function over whatever pool it is handed. Language selection
 * happens in the caller (`lib/db/learner-pools.ts`), never inside the builder
 * itself. A test asserts the absence, because a missing import is not
 * something a reviewer notices.
 */

export type LearnerLanguage = {
  languageCode: string;
  isActive: boolean;
  addedAt: string;
};

export type ListLanguagesOutcome =
  | { status: "ok"; languages: LearnerLanguage[] }
  | { status: "error"; error: string };

export type MutateLanguageOutcome =
  | { status: "ok" }
  | { status: "error"; error: string };

type DbRow = {
  language_code: string;
  is_active: boolean;
  added_at: string;
};

async function resolveClient(client?: SupabaseClient): Promise<SupabaseClient> {
  return client ?? (await createServerSupabaseClient());
}

function mapRow(row: DbRow): LearnerLanguage {
  return {
    languageCode: row.language_code,
    isActive: row.is_active,
    addedAt: row.added_at,
  };
}

/**
 * Availability is derived from what `data/starter/` actually ships, never from
 * a hand-kept list — a second list is how a language becomes selectable months
 * before it has a pool to select.
 */
export function languagesWithAPool(): readonly string[] {
  return availableLanguages();
}

async function listLearningLanguagesImpl(
  client?: SupabaseClient,
): Promise<ListLanguagesOutcome> {
  const supabase = await resolveClient(client);
  const account = await getAccount();
  if (!account) {
    const handled = languageNotSignedIn({ operation: "load your languages" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  const { data, error } = await supabase
    .from("learner_language")
    .select("language_code, is_active, added_at")
    .order("added_at", { ascending: true });

  if (error) {
    const handled = fromSupabaseLanguageError(error, { operation: "load your languages" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  // An empty list is a real answer — a learner who has not chosen yet. Callers
  // route that to the picker, so collapsing it into an error (or an error into
  // it) sends someone who is signed in and learning back to the front door.
  return { status: "ok", languages: (data ?? []).map((row) => mapRow(row as DbRow)) };
}

/** Cached per request — the shell and every page both need this list. */
export const listLearningLanguages = cache(listLearningLanguagesImpl);

export async function addLearningLanguage(
  languageCode: string,
  client?: SupabaseClient,
): Promise<MutateLanguageOutcome> {
  if (!isLanguageAvailable(languageCode)) {
    return {
      status: "error",
      error: `No word set ships for ${languageCode} yet, so it cannot be chosen.`,
    };
  }

  const supabase = await resolveClient(client);
  const account = await getAccount();
  if (!account) {
    const handled = languageNotSignedIn({ operation: "add a language" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  const existing = await listLearningLanguages(supabase);
  if (existing.status === "error") return existing;

  if (existing.languages.some((language) => language.languageCode === languageCode)) {
    return { status: "ok" };
  }

  // Adding is not switching (spec behaviour 3): a later language never steals
  // focus. The predicate is "nothing is active", not "the list is empty" — an
  // account that lost its active row would otherwise keep adding inactive
  // languages forever and never recover.
  const nothingActive = existing.languages.every((language) => !language.isActive);

  const { error } = await supabase.from("learner_language").insert({
    user_id: account.id,
    language_code: languageCode,
    is_active: nothingActive,
  });

  if (error) {
    const handled = fromSupabaseLanguageError(error, { operation: "add a language" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  return { status: "ok" };
}

/**
 * Moves the active pointer.
 *
 * The partial unique index enforces **at most one** active row. It cannot
 * enforce at least one, and an earlier version of this function relied on it as
 * though it could: it cleared, then set, checked neither result for rows
 * affected, and returned "ok" when the target did not exist — leaving the
 * account with languages and no active one, permanently, with no path back.
 *
 * So the target is verified against the account's own rows **before** anything
 * is cleared, and the set is checked for what it actually touched. The clear
 * still comes first, because the reverse order transiently has two active rows
 * and the index rejects it.
 */
export async function setActiveLanguage(
  languageCode: string,
  client?: SupabaseClient,
): Promise<MutateLanguageOutcome> {
  const supabase = await resolveClient(client);
  const account = await getAccount();
  if (!account) {
    const handled = languageNotSignedIn({ operation: "switch language" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  const existing = await listLearningLanguages(supabase);
  if (existing.status === "error") return existing;

  const target = existing.languages.find((language) => language.languageCode === languageCode);
  if (!target) {
    // Refused before the clear, so a stale code cannot cost the account its
    // active language.
    return { status: "error", error: "You are not learning that language." };
  }
  if (target.isActive) return { status: "ok" };

  const cleared = await supabase
    .from("learner_language")
    .update({ is_active: false })
    .eq("user_id", account.id)
    .eq("is_active", true);

  if (cleared.error) {
    const handled = fromSupabaseLanguageError(cleared.error, { operation: "switch language" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  const promoted = await supabase
    .from("learner_language")
    .update({ is_active: true })
    .eq("user_id", account.id)
    .eq("language_code", languageCode)
    .select("language_code");

  const touchedNothing = !promoted.error && (promoted.data?.length ?? 0) === 0;
  if (promoted.error || touchedNothing) {
    // The clear is already durable. Put the previous language back rather than
    // returning an error over an account that now has no language in focus.
    const previous = existing.languages.find((language) => language.isActive);
    if (previous) {
      await supabase
        .from("learner_language")
        .update({ is_active: true })
        .eq("user_id", account.id)
        .eq("language_code", previous.languageCode);
    }

    const handled = fromSupabaseLanguageError(promoted.error ?? { message: "no row promoted" }, {
      operation: "switch language",
    });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  return { status: "ok" };
}

/** The language the interface should show, or null when nothing is chosen yet. */
export function activeLanguageOf(languages: readonly LearnerLanguage[]): string | null {
  return languages.find((language) => language.isActive)?.languageCode ?? null;
}
