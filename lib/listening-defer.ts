/**
 * Temporary "can't listen now" preference. Contract:
 * docs/specs/feature/listening-defer.md
 */
export const LISTENING_DEFER_STORAGE_KEY = "sl-listening-defer-until";

/** Default defer duration — UC-077. */
export const LISTENING_DEFER_DURATION_MS = 15 * 60 * 1000;

export function readListeningDeferExpiry(now = Date.now()): number | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(LISTENING_DEFER_STORAGE_KEY);
  if (!raw) return null;

  const expiry = Number(raw);
  if (!Number.isFinite(expiry) || expiry <= now) {
    window.localStorage.removeItem(LISTENING_DEFER_STORAGE_KEY);
    return null;
  }

  return expiry;
}

export function isListeningDeferred(now = Date.now()): boolean {
  return readListeningDeferExpiry(now) !== null;
}

export function startListeningDefer(now = Date.now()): number {
  const expiry = now + LISTENING_DEFER_DURATION_MS;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(LISTENING_DEFER_STORAGE_KEY, String(expiry));
  }
  return expiry;
}

export function clearListeningDefer(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(LISTENING_DEFER_STORAGE_KEY);
  }
}

export function listeningDeferRemainingMs(now = Date.now()): number {
  const expiry = readListeningDeferExpiry(now);
  if (expiry === null) return 0;
  return Math.max(0, expiry - now);
}
