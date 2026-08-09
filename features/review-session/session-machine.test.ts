import { describe, expect, it } from "vitest";

import {
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
    expect(canGrade(phase)).toBe(true);

    phase = nextPhase(phase, "persisting");
    expect(canGrade(phase)).toBe(false);

    phase = nextPhase(phase, "revealed");
    expect(showsBack(phase)).toBe(true);

    phase = nextPhase(phase, "advancing");
    phase = nextPhase(phase, "prompting");
    expect(phase).toBe("prompting");
  });

  it("returns to prompting on persistence error", () => {
    expect(nextPhase("persisting", "prompting")).toBe("prompting");
  });

  it("rejects illegal transitions", () => {
    expect(nextPhase("prompting", "complete")).toBe("prompting");
    expect(nextPhase("revealed", "prompting")).toBe("revealed");
  });
});
