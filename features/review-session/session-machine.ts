/**
 * Review session FSM. Contract: docs/specs/feature/review-session.states.md
 */

export type SessionPhase =
  | "preparing"
  | "prompting"
  | "revealed"
  | "persisting"
  | "advancing"
  | "complete";

const TRANSITIONS: Record<SessionPhase, readonly SessionPhase[]> = {
  preparing: ["prompting", "complete"],
  prompting: ["revealed"],
  revealed: ["persisting"],
  persisting: ["revealed", "advancing"],
  advancing: ["prompting", "complete"],
  complete: [],
};

export function isTerminalPhase(phase: SessionPhase): boolean {
  return TRANSITIONS[phase].length === 0;
}

export function nextPhase(from: SessionPhase, to: SessionPhase): SessionPhase {
  if (isTerminalPhase(from)) return from;
  return TRANSITIONS[from].includes(to) ? to : from;
}

export function canFlip(phase: SessionPhase): boolean {
  return phase === "prompting";
}

export function canGrade(phase: SessionPhase): boolean {
  return phase === "revealed";
}

export function showsBack(phase: SessionPhase): boolean {
  return phase === "revealed" || phase === "persisting";
}
