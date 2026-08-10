import { describe, expect, it } from "vitest";

import {
  canFlip,
  canGrade,
  isTerminalPhase,
  nextPhase,
  showsBack,
} from "@/features/review-session/session-machine";

describe("session-machine", () => {
  it("marks complete as terminal", () => {
    expect(isTerminalPhase("complete")).toBe(true);
    expect(nextPhase("complete", "prompting")).toBe("complete");
  });

  it("follows the happy path", () => {
    let phase = nextPhase("preparing", "prompting");
    expect(phase).toBe("prompting");
    expect(canFlip(phase)).toBe(true);
    expect(canGrade(phase)).toBe(false);

    phase = nextPhase(phase, "revealed");
    expect(canGrade(phase)).toBe(true);
    expect(showsBack(phase)).toBe(true);

    phase = nextPhase(phase, "persisting");
    expect(canGrade(phase)).toBe(false);

    phase = nextPhase(phase, "advancing");
    phase = nextPhase(phase, "prompting");
    expect(phase).toBe("prompting");
  });

  it("returns to revealed on persistence error", () => {
    expect(nextPhase("persisting", "revealed")).toBe("revealed");
  });

  it("rejects illegal transitions", () => {
    expect(nextPhase("prompting", "complete")).toBe("prompting");
    expect(nextPhase("prompting", "persisting")).toBe("prompting");
    expect(nextPhase("revealed", "prompting")).toBe("revealed");
  });
});
