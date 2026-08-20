import type { SupabaseClient } from "@supabase/supabase-js";

import {
  isReportCategory,
  normalizeReportNote,
  type ReportCardInput,
} from "@/lib/card-report";
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
  input: ReportCardInput = {},
  client?: SupabaseClient,
): Promise<FlagCardOutcome> {
  const supabase = await resolveClient(client);
  const account = await getAccount();
  if (!account) {
    const handled = languageNotSignedIn({ operation: "report this card" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  const spoken = await getSpokenLanguage(supabase);
  if (spoken.status === "error") {
    return { status: "error", error: spoken.error };
  }

  const category =
    input.category && isReportCategory(input.category) ? input.category : null;
  const note = normalizeReportNote(input.note);

  const { error } = await supabase.from("card_content_flag").insert({
    user_id: account.id,
    word_id: wordId,
    spoken_language: spoken.spokenLanguage,
    category,
    note,
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

export type CardContentFlagRow = {
  wordId: string;
  spokenLanguage: string;
  category: string | null;
  note: string | null;
  flaggedAt: string;
};

export type ListFlagRowsOutcome =
  | { status: "ok"; flags: CardContentFlagRow[] }
  | { status: "error"; error: string };

/**
 * Every report this account has filed, in full. For the account export
 * (UC-024) — the session builder only ever needs the word ids, below, but a
 * learner's own free-text notes are their data and belong in the archive.
 */
export async function listAllCardContentFlags(
  client?: SupabaseClient,
): Promise<ListFlagRowsOutcome> {
  const supabase = await resolveClient(client);
  const account = await getAccount();
  if (!account) {
    const handled = languageNotSignedIn({ operation: "export your reported cards" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  const { data, error } = await supabase
    .from("card_content_flag")
    .select("word_id, spoken_language, category, note, flagged_at")
    .eq("user_id", account.id)
    .order("flagged_at", { ascending: true });

  if (error) {
    const handled = fromSupabaseLanguageError(error, {
      operation: "export your reported cards",
    });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  return {
    status: "ok",
    flags: (data ?? []).map((row) => ({
      wordId: row.word_id as string,
      spokenLanguage: row.spoken_language as string,
      category: (row.category as string | null) ?? null,
      note: (row.note as string | null) ?? null,
      flaggedAt: row.flagged_at as string,
    })),
  };
}

export async function listFlaggedWordIds(
  spokenLanguage: string,
  client?: SupabaseClient,
): Promise<ListFlaggedOutcome> {
  const supabase = await resolveClient(client);
  const account = await getAccount();
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
