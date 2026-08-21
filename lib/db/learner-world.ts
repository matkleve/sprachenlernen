import type { SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";

import { getAccount } from "@/lib/db/auth";
import { createServerSupabaseClient } from "@/lib/db/client";
import {
  databaseNotSignedIn,
  fromSupabaseLanguageError,
  logHandledErrorFromRequest,
} from "@/lib/errors";
import {
  defaultLearnerWorld,
  isLearnerWorldId,
  type LearnerWorld,
  type LearnerWorldId,
} from "@/lib/learner-world";

/**
 * Lernwelt persistence adapter. Contract: docs/specs/service/learner-world.md
 */

export type GetWorldOutcome =
  | { status: "ok"; world: LearnerWorld; hasRow: boolean }
  | { status: "error"; error: string };

export type SetWorldOutcome =
  | { status: "ok"; previousWorldId: LearnerWorldId | null }
  | { status: "error"; error: string };

export type ListWorldsOutcome =
  | { status: "ok"; worlds: Record<string, LearnerWorld> }
  | { status: "error"; error: string };

type DbRow = {
  language_code: string;
  world_id: string;
  set_at: string;
};

async function resolveClient(client?: SupabaseClient): Promise<SupabaseClient> {
  return client ?? (await createServerSupabaseClient());
}

function mapRow(row: DbRow): LearnerWorld {
  const worldId = isLearnerWorldId(row.world_id) ? row.world_id : "general";
  return { worldId, setAt: row.set_at };
}

export async function getLearnerWorld(
  languageCode: string,
  client?: SupabaseClient,
): Promise<GetWorldOutcome> {
  return getLearnerWorldCached(languageCode, client);
}

async function getLearnerWorldImpl(
  languageCode: string,
  client?: SupabaseClient,
): Promise<GetWorldOutcome> {
  const supabase = await resolveClient(client);
  const account = await getAccount();
  if (!account) {
    const handled = databaseNotSignedIn({ operation: "load your learning world" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  const { data, error } = await supabase
    .from("learner_world")
    .select("language_code, world_id, set_at")
    .eq("user_id", account.id)
    .eq("language_code", languageCode)
    .maybeSingle();

  if (error) {
    const handled = fromSupabaseLanguageError(error, { operation: "load your learning world" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  if (!data) {
    return { status: "ok", world: defaultLearnerWorld(), hasRow: false };
  }

  return { status: "ok", world: mapRow(data as DbRow), hasRow: true };
}

const getLearnerWorldCached = cache(getLearnerWorldImpl);

export async function listLearnerWorlds(client?: SupabaseClient): Promise<ListWorldsOutcome> {
  const supabase = await resolveClient(client);
  const account = await getAccount();
  if (!account) {
    const handled = databaseNotSignedIn({ operation: "load your learning worlds" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  const { data, error } = await supabase
    .from("learner_world")
    .select("language_code, world_id, set_at")
    .eq("user_id", account.id);

  if (error) {
    const handled = fromSupabaseLanguageError(error, { operation: "load your learning worlds" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  const worlds: Record<string, LearnerWorld> = {};
  for (const row of data ?? []) {
    worlds[(row as DbRow).language_code] = mapRow(row as DbRow);
  }
  return { status: "ok", worlds };
}

export async function setLearnerWorld(
  languageCode: string,
  worldId: LearnerWorldId,
  client?: SupabaseClient,
): Promise<SetWorldOutcome> {
  if (!isLearnerWorldId(worldId)) {
    return { status: "error", error: "Invalid learning world." };
  }

  const supabase = await resolveClient(client);
  const account = await getAccount();
  if (!account) {
    const handled = databaseNotSignedIn({ operation: "save your learning world" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  const existing = await getLearnerWorldImpl(languageCode, supabase);
  if (existing.status === "error") {
    return { status: "error", error: existing.error };
  }

  const previousWorldId = existing.hasRow ? existing.world.worldId : null;
  const payload = {
    user_id: account.id,
    language_code: languageCode,
    world_id: worldId,
    set_at: new Date().toISOString(),
  };

  const { error } = existing.hasRow
    ? await supabase
        .from("learner_world")
        .update({ world_id: worldId, set_at: payload.set_at })
        .eq("user_id", account.id)
        .eq("language_code", languageCode)
    : await supabase.from("learner_world").insert(payload);

  if (error) {
    const handled = fromSupabaseLanguageError(error, { operation: "save your learning world" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  return { status: "ok", previousWorldId };
}
