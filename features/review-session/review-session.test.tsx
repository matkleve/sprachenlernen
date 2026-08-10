import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  appendReviewAction,
  buildSessionAction,
} from "@/features/review-session/actions";
import { ReviewSession } from "@/features/review-session/ReviewSession";
import { copy } from "@/features/review-session/content";

vi.mock("@/features/review-session/actions", () => ({
  appendReviewAction: vi.fn().mockResolvedValue({ status: "appended", id: "row-1" }),
  buildSessionAction: vi.fn().mockResolvedValue({
    status: "ok",
    languageName: "Spanish",
    queue: [
      {
        taskId: "es:de:meaning-recall",
        wordId: "es:de",
        lemma: "de",
        front: "de",
        back: "of, from",
        frequencyRank: 1,
        position: 1,
        total: 2,
      },
      {
        taskId: "es:que:meaning-recall",
        wordId: "es:que",
        lemma: "que",
        front: "que",
        back: "that, which",
        frequencyRank: 2,
        position: 2,
        total: 2,
      },
    ],
  }),
}));

vi.mock("@/lib/installation-id", () => ({
  getInstallationId: vi.fn().mockReturnValue("11111111-1111-4111-8111-111111111111"),
}));

describe("ReviewSession", () => {
  it("shows the first card, flips on tap, then persists a grade", async () => {
    const user = userEvent.setup();
    render(<ReviewSession methodName="Spaced repetition session" />);

    await waitFor(() => {
      expect(screen.getByText("de")).toBeDefined();
    });

    expect(screen.getByText("Spanish")).toBeDefined();
    expect(screen.queryByRole("button", { name: copy.good })).toBeNull();

    await user.click(screen.getByRole("button", { name: copy.flipHint }));

    await waitFor(() => {
      expect(screen.getByText("of, from")).toBeDefined();
    });

    await user.click(screen.getByRole("button", { name: copy.good }));

    expect(appendReviewAction).toHaveBeenCalledWith(
      expect.objectContaining({
        taskId: "es:de:meaning-recall",
        grade: "good",
        installationId: "11111111-1111-4111-8111-111111111111",
        latencyMs: expect.any(Number),
      }),
    );
  });

  it("shows an error when persistence fails", async () => {
    vi.mocked(appendReviewAction).mockResolvedValueOnce({
      status: "error",
      error: "permission denied",
    });

    const user = userEvent.setup();
    render(<ReviewSession methodName="Spaced repetition session" />);

    await waitFor(() => {
      expect(screen.getByText("de")).toBeDefined();
    });

    await user.click(screen.getByRole("button", { name: copy.flipHint }));
    await user.click(screen.getByRole("button", { name: copy.good }));

    await waitFor(() => {
      expect(screen.getByText(copy.saveError)).toBeDefined();
    });
  });

  it("shows a load error when the queue cannot be built", async () => {
    vi.mocked(buildSessionAction).mockResolvedValueOnce({
      status: "error",
      error: "Not signed in.",
    });

    render(<ReviewSession methodName="Spaced repetition session" />);

    await waitFor(() => {
      expect(screen.getByText("Not signed in.")).toBeDefined();
    });
  });

  it("ends in the session summary with no grade buttons once the last card is graded", async () => {
    const user = userEvent.setup();
    render(<ReviewSession methodName="Spaced repetition session" />);

    await waitFor(() => expect(screen.getByText("de")).toBeDefined());
    await user.click(screen.getByRole("button", { name: copy.flipHint }));
    await user.click(screen.getByRole("button", { name: copy.good }));

    await waitFor(() => expect(screen.getByText("que")).toBeDefined());
    await user.click(screen.getByRole("button", { name: copy.flipHint }));
    await user.click(screen.getByRole("button", { name: copy.good }));

    await waitFor(() => expect(screen.getByText(copy.completeTitle)).toBeDefined());

    for (const grade of [copy.again, copy.hard, copy.good, copy.easy]) {
      expect(screen.queryByRole("button", { name: grade }), `${grade} must be gone`).toBeNull();
    }
    expect(screen.getByText(copy.completeBody(2))).toBeDefined();
  });

  it("never shows a due count, a backlog figure or a badge", async () => {
    const user = userEvent.setup();
    const { container } = render(<ReviewSession methodName="Spaced repetition session" />);

    await waitFor(() => expect(screen.getByText("de")).toBeDefined());

    const forbidden = /\bdue\b|\bbacklog\b|\boverdue\b|\bremaining\b|\bleft to\b/i;

    const leafText = () =>
      Array.from(container.querySelectorAll("*"))
        .filter((element) => element.children.length === 0)
        .map((element) => element.textContent?.trim() ?? "")
        .filter(Boolean)
        .join(" | ");

    expect(leafText()).not.toMatch(forbidden);
    expect(screen.getByText(copy.progress(1, 2))).toBeDefined();

    await user.click(screen.getByRole("button", { name: copy.flipHint }));
    await user.click(screen.getByRole("button", { name: copy.good }));
    await waitFor(() => expect(screen.getByText("que")).toBeDefined());
    expect(leafText()).not.toMatch(forbidden);

    await user.click(screen.getByRole("button", { name: copy.flipHint }));
    await user.click(screen.getByRole("button", { name: copy.good }));
    await waitFor(() => expect(screen.getByText(copy.completeTitle)).toBeDefined());
    expect(leafText()).not.toMatch(forbidden);
  });

  it("advances to the second card after grading the first", async () => {
    const user = userEvent.setup();
    render(<ReviewSession methodName="Spaced repetition session" />);

    await waitFor(() => {
      expect(screen.getByText("de")).toBeDefined();
    });

    await user.click(screen.getByRole("button", { name: copy.flipHint }));
    await user.click(screen.getByRole("button", { name: copy.good }));

    await waitFor(() => {
      expect(screen.getByText("que")).toBeDefined();
      expect(screen.queryByText("de")).toBeNull();
    });
  });
});
