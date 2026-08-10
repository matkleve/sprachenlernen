"use server";

import { redirect } from "next/navigation";

import { buildExportPayload } from "@/features/account-data/export";
import type { ExportScope } from "@/features/account-data/content";
import { deleteAccount, getAccount } from "@/lib/db/auth";
import { listAllReviews } from "@/lib/db/review-log";
import { routes } from "@/lib/routes";

export type ExportActionResult =
  | { status: "ok"; json: string }
  | { status: "error"; error: string };

export async function exportAccountDataAction(scope: ExportScope): Promise<ExportActionResult> {
  const account = await getAccount();
  if (!account) {
    return { status: "error", error: "You must be signed in to export your data." };
  }

  const outcome = await listAllReviews();
  if (outcome.status === "error") {
    return { status: "error", error: outcome.error };
  }

  const payload = buildExportPayload(scope, account, outcome.reviews);
  return { status: "ok", json: JSON.stringify(payload, null, 2) };
}

export async function deleteAccountAction(): Promise<{ status: "error"; error: string } | void> {
  const outcome = await deleteAccount();
  if (outcome.status === "error") {
    return outcome;
  }
  redirect(routes.landing);
}
