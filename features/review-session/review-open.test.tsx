import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { appendReviewAction } from "@/features/review-session/actions";

import { ReviewOpen } from "./ReviewOpen";
import { copy } from "./content";

vi.mock("@/features/review-session/actions", () => ({
  appendReviewAction: vi.fn().mockResolvedValue({ status: "appended", id: "row-1" }),
}));

vi.mock("@/lib/installation-id", () => ({
  getInstallationId: vi.fn().mockReturnValue("11111111-1111-4111-8111-111111111111"),
}));

describe("ReviewOpen", () => {
  it("shows grade buttons and persists a tap", async () => {
    const user = userEvent.setup();
    render(<ReviewOpen methodName="SRS session" />);

    await user.click(screen.getByRole("button", { name: copy.good }));

    await waitFor(() => {
      expect(screen.getByText(copy.graded)).toBeDefined();
    });

    expect(appendReviewAction).toHaveBeenCalledWith(
      expect.objectContaining({
        taskId: copy.demoTaskId,
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
    render(<ReviewOpen methodName="SRS session" />);

    await user.click(screen.getByRole("button", { name: copy.good }));

    await waitFor(() => {
      expect(screen.getByText(copy.saveError)).toBeDefined();
    });
  });
});
