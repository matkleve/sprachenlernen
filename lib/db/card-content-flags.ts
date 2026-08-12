import type { SupabaseClient } from "@supabase/supabase-js";

import { getAccount } from "@/lib/db/auth";
import { createServerSupabaseClient } from "@/lib/db/client";
import { getSpokenLanguage } from "@/lib/db/profiles";
import {
  fromSupabaseLanguageError,
  languageNotSignedIn,
  logHandledErrorFromRequest,
} from "@/lib/errors";

/**
 * Learner content flags (UC-023). Contract:
 * docs/specs/service/broken-card-detection.md
 */

export type FlagCardOutcome = { status: "ok" } | { status: "error"; error: string };

export type ListFlaggedOutcome =
  | { status: "ok"; wordIds: string[] }
  | { status: "error"; error: string };

async function resolveClient(client?: SupabaseClient): Promise<SupabaseClient> {
  return client ?? (await createServerSupabaseClient());
}

export async function flagCardContent(
  wordId: string,
  client?: SupabaseClient,
): Promise<FlagCardOutcome> {
  const supabase = await resolveClient(client);
  const account = await getAccount(supabase);
  if (!account) {
    const handled = languageNotSignedIn({ operation: "report this card" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  const spoken = await getSpokenLanguage(supabase);
  if (spoken.status === "error") {
    return { status: "error", error: spoken.error };
  }

  const { error } = await supabase.from("card_content_flag").insert({
    user_id: account.id,
    word_id: wordId,
    spoken_language: spoken.spokenLanguage,
  });

  // Duplicate report on the same key is success — idempotent per spec.
  if (error && error.code !== "23505") {
    const handled = fromSupabaseLanguageError(error, {
      operation: "report this card",
    });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  return { status: "ok" };
}

export async function listFlaggedWordIds(
  spokenLanguage: string,
  client?: SupabaseClient,
): Promise<ListFlaggedOutcome> {
  const supabase = await resolveClient(client);
  const account = await getAccount(supabase);
  if (!account) {
    const handled = languageNotSignedIn({ operation: "load your reported cards" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  const { data, error } = await supabase
    .from("card_content_flag")
    .select("word_id")
    .eq("user_id", account.id)
    .eq("spoken_language", spokenLanguage);

  if (error) {
    const handled = fromSupabaseLanguageError(error, {
      operation: "load your reported cards",
    });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  return { status: "ok", wordIds: (data ?? []).map((row) => row.word_id) };
}
