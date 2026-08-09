/**
 * Browser installation identity. Contract: docs/specs/service/review-log.md
 *
 * One random UUID per browser profile, used only to order and de-duplicate
 * rows during a later merge (ADR-0005) — not a device fingerprint.
 */

import { isUuid } from "@/lib/uuid";

const STORAGE_KEY = "sl-installation-id";

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
