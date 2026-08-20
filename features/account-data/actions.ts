"use server";

import { redirect } from "next/navigation";

import { buildExportPayload, type AccountArchive } from "@/features/account-data/export";
import type { ExportScope } from "@/features/account-data/content";
import { deleteAccount, getAccount } from "@/lib/db/auth";
import { listAllCardContentFlags } from "@/lib/db/card-content-flags";
import { listAllLearnerSources } from "@/lib/db/content-sources";
import { listLearningLanguages } from "@/lib/db/learning-languages";
import { getSpokenLanguage } from "@/lib/db/profiles";
import { listAllReviews } from "@/lib/db/review-log";
import { listTaskStatesForUser } from "@/lib/db/task-state";
import { routes } from "@/lib/routes";

export type ExportActionResult =
  | { status: "ok"; json: string }
  | { status: "error"; error: string };

/**
 * Reads every table the account owns, for the complete archive (UC-024).
 *
 * One `Promise.all`, not five awaits: each query is an independent round trip
 * scoped by RLS, and serialising them made the download button sit pending for
 * no reason. Any single failure fails the export — a partial archive that
 * looks complete is the failure UC-024 opens by describing.
 */
async function readArchive(): Promise<
  { status: "ok"; archive: AccountArchive } | { status: "error"; error: string }
> {
  const [taskStates, sources, flags, languages, spoken] = await Promise.all([
    listTaskStatesForUser(),
    listAllLearnerSources(),
    listAllCardContentFlags(),
    listLearningLanguages(),
    getSpokenLanguage(),
  ]);

  if (taskStates.status === "error") return taskStates;
  if (sources.status === "error") return sources;
  if (flags.status === "error") return flags;
  if (languages.status === "error") return languages;
  if (spoken.status === "error") return spoken;

  return {
    status: "ok",
    archive: {
      taskStates: taskStates.rows,
      sources: sources.sources,
      flags: flags.flags,
      languages: languages.languages,
      spokenLanguage: spoken.spokenLanguage,
    },
  };
}

export async function exportAccountDataAction(scope: ExportScope): Promise<ExportActionResult> {
  const account = await getAccount();
  if (!account) {
    return { status: "error", error: "You must be signed in to export your data." };
  }

  const outcome = await listAllReviews();
  if (outcome.status === "error") {
    return { status: "error", error: outcome.error };
  }

  // The review-log scope reads one table on purpose — it is the "just the
  // history" answer, and paying for five more queries to discard them would
  // make the narrower choice the slower one.
  if (scope === "reviews") {
    return {
      status: "ok",
      json: JSON.stringify(buildExportPayload(scope, account, outcome.reviews), null, 2),
    };
  }

  const archive = await readArchive();
  if (archive.status === "error") {
    return { status: "error", error: archive.error };
  }

  const payload = buildExportPayload(scope, account, outcome.reviews, archive.archive);
  return { status: "ok", json: JSON.stringify(payload, null, 2) };
}

export async function deleteAccountAction(): Promise<{ status: "error"; error: string } | void> {
  const outcome = await deleteAccount();
  if (outcome.status === "error") {
    return outcome;
  }
  redirect(routes.landing);
}
