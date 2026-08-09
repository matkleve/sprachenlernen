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
  it("shows the first card and persists a grade", async () => {
    const user = userEvent.setup();
    render(<ReviewSession methodName="SRS session" />);

    await waitFor(() => {
      expect(screen.getByText("de")).toBeDefined();
    });

    await user.click(screen.getByRole("button", { name: copy.good }));

    await waitFor(() => {
      expect(screen.getByText("of, from")).toBeDefined();
    });

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
    render(<ReviewSession methodName="SRS session" />);

    await waitFor(() => {
      expect(screen.getByText("de")).toBeDefined();
    });

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

    render(<ReviewSession methodName="SRS session" />);

    await waitFor(() => {
      expect(screen.getByText("Not signed in.")).toBeDefined();
    });
  });

  it("advances to the second card after grading the first", async () => {
    const user = userEvent.setup();
    render(<ReviewSession methodName="SRS session" />);

    await waitFor(() => {
      expect(screen.getByText("de")).toBeDefined();
    });

    await user.click(screen.getByRole("button", { name: copy.good }));

    await waitFor(() => {
      expect(screen.getByText("of, from")).toBeDefined();
    });

    await waitFor(
      () => {
        expect(screen.getByText("que")).toBeDefined();
        expect(screen.queryByText("de")).toBeNull();
      },
      { timeout: 2000 },
    );
  });
});
