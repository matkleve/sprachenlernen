/**
 * Session-only learner source for one practice run (T-W9).
 * Contract: docs/specs/feature/word-capture.md
 */
import type { Source, SourceKind, SourceOrigin } from "@/lib/coverage";

export const EPHEMERAL_SOURCE_COOKIE = "sl-ephemeral-source";

/** Cookie budget — above this, learner must check "Keep in library" (DB). */
export const EPHEMERAL_SOURCE_MAX_BODY_CHARS = 3500;

const SOURCE_KINDS: readonly SourceKind[] = ["text", "audio"];
const SOURCE_ORIGINS: readonly SourceOrigin[] = ["catalogue", "fixture", "learner"];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function parseSource(value: unknown): Source | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || value.id === "") return null;
  if (typeof value.languageCode !== "string" || value.languageCode === "") return null;
  if (!SOURCE_KINDS.includes(value.kind as SourceKind)) return null;
  if (typeof value.title !== "string" || value.title === "") return null;
  if (!SOURCE_ORIGINS.includes(value.origin as SourceOrigin)) return null;
  if (typeof value.addedAt !== "string" || value.addedAt === "") return null;
  if (value.ephemeral !== true) return null;

  const body = typeof value.body === "string" ? value.body : undefined;
  const transcript = typeof value.transcript === "string" ? value.transcript : undefined;
  if (value.kind === "text" && (!body || body.trim() === "")) return null;
  if (value.kind === "audio" && (!transcript || transcript.trim() === "")) return null;

  return {
    id: value.id,
    languageCode: value.languageCode,
    kind: value.kind as SourceKind,
    title: value.title,
    origin: value.origin as SourceOrigin,
    body,
    transcript,
    tags: Array.isArray(value.tags)
      ? value.tags.filter((tag): tag is string => typeof tag === "string")
      : undefined,
    sourceUrl: typeof value.sourceUrl === "string" ? value.sourceUrl : undefined,
    addedAt: value.addedAt,
    ephemeral: true,
  };
}

export function serializeEphemeralSourceCookie(source: Source): string {
  const body = source.body ?? "";
  if (body.length > EPHEMERAL_SOURCE_MAX_BODY_CHARS) {
    throw new Error("Text is too long for a session-only start — keep in library or shorten.");
  }
  if (!source.ephemeral) {
    throw new Error("Only ephemeral learner sources belong in the session cookie.");
  }
  return JSON.stringify(source);
}

export function parseEphemeralSourceCookie(value: string | undefined): Source | null {
  if (!value) return null;
  try {
    return parseSource(JSON.parse(value));
  } catch {
    return null;
  }
}
