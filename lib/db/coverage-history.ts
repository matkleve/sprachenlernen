import type { SupabaseClient } from "@supabase/supabase-js";

import { getAccount } from "@/lib/db/auth";
import { createServerSupabaseClient } from "@/lib/db/client";
import type { CoverageHistoryRow } from "@/lib/coverage";
import type { CoverageSnapshotInput } from "@/lib/coverage-snapshots";
import {
  databaseNotSignedIn,
  fromSupabaseLanguageError,
  logHandledErrorFromRequest,
} from "@/lib/errors";

/**
 * coverage_history adapter. Contract: docs/specs/service/coverage.md
 */

export type CoverageHistoryDbRow = {
  source_id: string;
  measured_at: string;
  coverage_percent: number;
  calibration_dated: string | null;
};

export type CoverageHistorySourceRow = CoverageHistoryRow & {
  sourceId: string;
};

export type ListCoverageHistoryOutcome =
  | { status: "ok"; rows: CoverageHistorySourceRow[] }
  | { status: "error"; error: string };

export type AppendCoverageSnapshotsOutcome =
  | { status: "ok"; appended: number }
  | { status: "error"; error: string };

async function resolveClient(client?: SupabaseClient): Promise<SupabaseClient> {
  return client ?? (await createServerSupabaseClient());
}

function mapRow(row: CoverageHistoryDbRow): CoverageHistorySourceRow {
  return {
    sourceId: row.source_id,
    measuredAt: row.measured_at,
    coveragePercent: Number(row.coverage_percent),
    calibrationDated: row.calibration_dated,
  };
}

export async function listCoverageHistoryForLanguage(
  languageCode: string,
  client?: SupabaseClient,
): Promise<ListCoverageHistoryOutcome> {
  const supabase = await resolveClient(client);
  const account = await getAccount();
  if (!account) {
    return { status: "ok", rows: [] };
  }

  const { data, error } = await supabase
    .from("coverage_history")
    .select("source_id, measured_at, coverage_percent, calibration_dated")
    .eq("user_id", account.id)
    .eq("language_code", languageCode)
    .order("measured_at", { ascending: true });

  if (error) {
    const handled = fromSupabaseLanguageError(error, {
      operation: "load your coverage history",
    });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  return {
    status: "ok",
    rows: (data ?? []).map((row) => mapRow(row as CoverageHistoryDbRow)),
  };
}

export async function appendCoverageSnapshots(
  languageCode: string,
  snapshots: readonly CoverageSnapshotInput[],
  measuredAt: string = new Date().toISOString(),
  client?: SupabaseClient,
): Promise<AppendCoverageSnapshotsOutcome> {
  if (snapshots.length === 0) {
    return { status: "ok", appended: 0 };
  }

  const supabase = await resolveClient(client);
  const account = await getAccount();
  if (!account) {
    const handled = databaseNotSignedIn({ operation: "save coverage history" });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  const payload = snapshots.map((snapshot) => ({
    user_id: account.id,
    language_code: languageCode,
    source_id: snapshot.sourceId,
    measured_at: measuredAt,
    coverage_percent: snapshot.coveragePercent,
    calibration_dated: snapshot.calibrationDated,
  }));

  const { error } = await supabase.from("coverage_history").insert(payload);

  if (error) {
    const handled = fromSupabaseLanguageError(error, {
      operation: "save coverage history",
    });
    void logHandledErrorFromRequest(handled);
    return { status: "error", error: handled.userMessage };
  }

  return { status: "ok", appended: snapshots.length };
}
