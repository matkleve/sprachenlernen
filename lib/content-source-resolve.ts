import { cookies } from "next/headers";

import { findContentSourceById } from "@/lib/content-sources";
import type { Source } from "@/lib/coverage";
import { findLearnerSourceById } from "@/lib/db/content-sources";
import {
  EPHEMERAL_SOURCE_COOKIE,
  parseEphemeralSourceCookie,
} from "@/lib/ephemeral-source-cookie";

/**
 * Resolve a Source for server routes — catalogue JSON, saved learner row, or
 * ephemeral session cookie. Contract: docs/specs/feature/word-capture.md
 */
export async function resolveContentSourceById(sourceId: string): Promise<Source | null> {
  const catalogue = findContentSourceById(sourceId);
  if (catalogue) return catalogue;

  const cookieStore = await cookies();
  const ephemeral = parseEphemeralSourceCookie(cookieStore.get(EPHEMERAL_SOURCE_COOKIE)?.value);
  if (ephemeral?.id === sourceId) return ephemeral;

  const learner = await findLearnerSourceById(sourceId);
  if (learner.status === "ok") return learner.source;
  return null;
}
