/**
 * Build timestamp baked in at deploy — same value on client bundle and server.
 * Contract: docs/specs/feature/app-update.md
 */
export const APP_BUILT_AT = process.env.NEXT_PUBLIC_APP_BUILT_AT ?? null;

export function parseAppBuiltAt(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const timestamp = Date.parse(raw);
  return Number.isNaN(timestamp) ? null : timestamp;
}

/** Milliseconds since epoch for the running build, or null when unset. */
export const APP_BUILT_AT_MS = parseAppBuiltAt(APP_BUILT_AT);
