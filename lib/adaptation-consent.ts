/**
 * Explicit opt-in before cloud/LLM adaptation on learner uploads.
 * Contract: docs/specs/service/content-ingestion.md (lane A)
 */

export const ADAPTATION_CONSENT_COOKIE = "sl-adaptation-consent";

const ADAPTATION_CONSENT_VALUE = "1";

export function parseAdaptationConsent(value: string | undefined): boolean {
  return value === ADAPTATION_CONSENT_VALUE;
}

export function serializeAdaptationConsent(): string {
  return ADAPTATION_CONSENT_VALUE;
}
