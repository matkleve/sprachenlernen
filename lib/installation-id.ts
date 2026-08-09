/**
 * Browser installation identity. Contract: docs/specs/service/review-log.md
 *
 * One random UUID per browser profile, used only to order and de-duplicate
 * rows during a later merge (ADR-0005) — not a device fingerprint.
 */

const STORAGE_KEY = "sl-installation-id";

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

/** Returns the installation id for this browser profile, creating one if needed. */
export function getInstallationId(): string {
  if (typeof window === "undefined") {
    throw new Error("getInstallationId() is client-only.");
  }

  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing && isUuid(existing)) {
    return existing;
  }

  const id = crypto.randomUUID();
  window.localStorage.setItem(STORAGE_KEY, id);
  return id;
}
