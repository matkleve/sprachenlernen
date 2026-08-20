import type { SupabaseClient } from "@supabase/supabase-js";

import { getAccount } from "@/lib/db/auth";
import { createServerSupabaseClient } from "@/lib/db/client";
import type { Source, SourceKind } from "@/lib/coverage";
import { rejectOversizeLearnerText } from "@/lib/learner-text-limits";
import { titleFromLearnerText } from "@/lib/method-material-setup";
import {
  databaseNotSignedIn,
  fromSupabaseLanguageError,
  logHandledErrorFromRequest,
} from "@/lib/errors";

/**
 * Learner-owned content sources (UC-012). Contract:
 * docs/specs/feature/word-capture.md
 */

export type ContentSourceRow = {
  id: string;
  language_code: string;
  kind: SourceKind;
  title: string;
  body: string | null;
  transcript: string | null;
  tags: string[] | null;
  source_url: string | null;
  added_at: string;
};

export type LearnerSourceOutcome =
  | { status: "ok"; source: Source }
  | { status: "error"; error: string };

export type LearnerSourcesOutcome =
  | { status: "ok"; sources: Source[] }
  | { status: "error"; error: string };

async function resolveClient(client?: SupabaseClient): Promise<SupabaseClient> {
  return client ?? (await createServerSupabaseClient());
}

export function rowToSource(row: ContentSourceRow): Source {
  return {
    id: row.id,
    languageCode: row.language_code,
    kind: row.kind,
    title: row.title,
    origin: "learner",
    body: row.body ?? undefined,
    transcript: row.transcript ?? undefined,
    tags: row.tags ?? undefined,
    sourceUrl: row.source_url ?? undefined,
    addedAt: row.added_at,
    ephemeral: false,
  };
}

export async function createLearnerTextSource(
  input: { languageCode: string; body: string; title?: string },
  client?: SupabaseClient,
): Promise<LearnerSourceOutcome> {
  const supabase = await resolveClient(client);
  const account = await getAccount();
  if (!account) {
    const handled = databaseNotSignedIn({ operation: "save this text to your library" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  const trimmed = input.body.trim();
  if (!trimmed) {
    return { status: "error", error: "Paste some text before saving." };
  }

  // Before the round trip, not after: the column's check constraint is the
  // backstop, and a constraint violation surfaces as a generic database error
  // that tells the learner nothing about what to do next.
  const oversize = rejectOversizeLearnerText(trimmed);
  if (oversize) return oversize;

  const title = input.title ?? titleFromLearnerText(trimmed);

  const { data, error } = await supabase
    .from("content_sources")
    .insert({
      user_id: account.id,
      language_code: input.languageCode,
      kind: "text",
      title,
      body: trimmed,
    })
    .select(
      "id, language_code, kind, title, body, transcript, tags, source_url, added_at",
    )
    .single();

  if (error || !data) {
    const handled = fromSupabaseLanguageError(error ?? new Error("insert failed"), {
      operation: "save this text to your library",
    });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  return { status: "ok", source: rowToSource(data as ContentSourceRow) };
}

export async function listLearnerSourcesForLanguage(
  languageCode: string,
  client?: SupabaseClient,
): Promise<LearnerSourcesOutcome> {
  const supabase = await resolveClient(client);
  const account = await getAccount();
  if (!account) {
    return { status: "ok", sources: [] };
  }

  const { data, error } = await supabase
    .from("content_sources")
    .select(
      "id, language_code, kind, title, body, transcript, tags, source_url, added_at",
    )
    .eq("user_id", account.id)
    .eq("language_code", languageCode)
    .order("added_at", { ascending: false });

  if (error) {
    const handled = fromSupabaseLanguageError(error, {
      operation: "load your saved texts",
    });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  return {
    status: "ok",
    sources: (data ?? []).map((row) => rowToSource(row as ContentSourceRow)),
  };
}

/**
 * Every saved source this account owns, across all languages. For the account
 * export (UC-024) — the per-language listing above is what surfaces drive.
 */
export async function listAllLearnerSources(
  client?: SupabaseClient,
): Promise<LearnerSourcesOutcome> {
  const supabase = await resolveClient(client);
  const account = await getAccount();
  if (!account) {
    const handled = databaseNotSignedIn({ operation: "export your saved texts" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  const { data, error } = await supabase
    .from("content_sources")
    .select(
      "id, language_code, kind, title, body, transcript, tags, source_url, added_at",
    )
    .eq("user_id", account.id)
    .order("added_at", { ascending: true });

  if (error) {
    const handled = fromSupabaseLanguageError(error, {
      operation: "export your saved texts",
    });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  return {
    status: "ok",
    sources: (data ?? []).map((row) => rowToSource(row as ContentSourceRow)),
  };
}

export async function findLearnerSourceById(
  sourceId: string,
  client?: SupabaseClient,
): Promise<LearnerSourceOutcome | { status: "not-found" }> {
  const supabase = await resolveClient(client);
  const account = await getAccount();
  if (!account) {
    return { status: "not-found" };
  }

  const { data, error } = await supabase
    .from("content_sources")
    .select(
      "id, language_code, kind, title, body, transcript, tags, source_url, added_at",
    )
    .eq("user_id", account.id)
    .eq("id", sourceId)
    .maybeSingle();

  if (error) {
    const handled = fromSupabaseLanguageError(error, {
      operation: "load this text",
    });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  if (!data) return { status: "not-found" };
  return { status: "ok", source: rowToSource(data as ContentSourceRow) };
}
