/**
 * Personal coverage delivery gate before Start.
 * Contract: docs/specs/service/content-adaptation.md (#37)
 */

export const PERSONAL_COMFORT_MIN = 95;
export const PERSONAL_T1_MIN = 80;

export const DELIVERY_GATES = ["comfortable", "t1-support", "blocked"] as const;
export type DeliveryGate = (typeof DELIVERY_GATES)[number];

export function deliveryGateForCoverage(coveragePercent: number): DeliveryGate {
  if (coveragePercent >= PERSONAL_COMFORT_MIN) return "comfortable";
  if (coveragePercent >= PERSONAL_T1_MIN) return "t1-support";
  return "blocked";
}

export function startEnabledForGate(gate: DeliveryGate): boolean {
  return gate !== "blocked";
}
