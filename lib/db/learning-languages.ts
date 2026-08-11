import type { SupabaseClient } from "@supabase/supabase-js";

import { getAccount } from "@/lib/db/auth";
import { createServerSupabaseClient } from "@/lib/db/client";
import { databaseNotSignedIn, fromSupabaseReviewError, logHandledErrorFromRequest } from "@/lib/errors";
import { availableLanguages, isLanguageAvailable } from "@/lib/starter-deck";

/**
 * Learning-language adapter. Contract:
 * docs/specs/service/learning-languages.md
 *
 * A **learning language** is one this Account is learning; there may be
 * several. The **active** language is the one the interface is showing; there
 * is exactly one, and it decides what is displayed and nothing else.
 *
 * ⚠ Nothing here may be imported by `lib/session-builder.ts`. The active
 * language is a view concern; the moment it filters what gets scheduled, the
 * combined daily budget stops splitting across languages and the older one
 * decays — the exact failure UC-025 exists to prevent. A test asserts the
 * absence, because a missing import is not something a reviewer notices.
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

export async function listLearningLanguages(
  client?: SupabaseClient,
): Promise<ListLanguagesOutcome> {
  const supabase = await resolveClient(client);
  const account = await getAccount(supabase);
  if (!account) {
    const handled = databaseNotSignedIn({ operation: "load your languages" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  const { data, error } = await supabase
    .from("learner_language")
    .select("language_code, is_active, added_at")
    .order("added_at", { ascending: true });

  if (error) {
    const handled = fromSupabaseReviewError(error, { operation: "load your languages" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  // An empty list is a real answer — a learner who has not chosen yet. Callers
  // route that to the picker, so collapsing it into an error (or an error into
  // it) sends someone who is signed in and learning back to the front door.
  return { status: "ok", languages: (data ?? []).map((row) => mapRow(row as DbRow)) };
}

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
  const account = await getAccount(supabase);
  if (!account) {
    const handled = databaseNotSignedIn({ operation: "add a language" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  const existing = await listLearningLanguages(supabase);
  if (existing.status === "error") return existing;

  // Adding is not switching (spec behaviour 3). The first language becomes
  // active because something has to be; a later one never steals focus.
  const isFirst = existing.languages.length === 0;
  if (existing.languages.some((language) => language.languageCode === languageCode)) {
    return { status: "ok" };
  }

  const { error } = await supabase.from("learner_language").insert({
    user_id: account.id,
    language_code: languageCode,
    is_active: isFirst,
  });

  if (error) {
    const handled = fromSupabaseReviewError(error, { operation: "add a language" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  return { status: "ok" };
}

/**
 * Moves the active pointer. Clears first, then sets — the partial unique index
 * makes the reverse order fail, and relying on statement ordering to satisfy a
 * constraint is the kind of thing that works until two tabs do it at once.
 */
export async function setActiveLanguage(
  languageCode: string,
  client?: SupabaseClient,
): Promise<MutateLanguageOutcome> {
  const supabase = await resolveClient(client);
  const account = await getAccount(supabase);
  if (!account) {
    const handled = databaseNotSignedIn({ operation: "switch language" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  const cleared = await supabase
    .from("learner_language")
    .update({ is_active: false })
    .eq("user_id", account.id)
    .eq("is_active", true);

  if (cleared.error) {
    const handled = fromSupabaseReviewError(cleared.error, { operation: "switch language" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  const { error } = await supabase
    .from("learner_language")
    .update({ is_active: true })
    .eq("user_id", account.id)
    .eq("language_code", languageCode);

  if (error) {
    const handled = fromSupabaseReviewError(error, { operation: "switch language" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  return { status: "ok" };
}

/** The language the interface should show, or null when nothing is chosen yet. */
export function activeLanguageOf(languages: readonly LearnerLanguage[]): string | null {
  return languages.find((language) => language.isActive)?.languageCode ?? null;
}
