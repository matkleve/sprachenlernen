import userEvent from "@testing-library/user-event";
import { renderWithIntl, screen, en } from "@/tests/i18n-test-utils";
import { describe, expect, it, vi } from "vitest";

import { LearnerWorldSetup } from "@/features/learner-world/LearnerWorldSetup";

vi.mock("@/features/learner-world/actions", () => ({
  saveLearnerWorldAction: vi.fn(),
}));

import { saveLearnerWorldAction } from "@/features/learner-world/actions";

/** Contract: docs/specs/feature/learner-world-setup.md (T-W23) */

describe("LearnerWorldSetup", () => {
  it("walks through politics pick and saves politics", async () => {
    const user = userEvent.setup();
    renderWithIntl(<LearnerWorldSetup />);

    await user.click(screen.getByRole("button", { name: en.learnerWorld.continue }));
    await user.click(screen.getByRole("button", { name: en.learnerWorld.world.politics }));
    await user.click(screen.getByRole("button", { name: en.learnerWorld.continue }));

    expect(screen.getByText(en.learnerWorld.preview.politics)).toBeDefined();

    await user.click(screen.getByRole("button", { name: en.learnerWorld.startLearning }));

    expect(saveLearnerWorldAction).toHaveBeenCalledWith("politics");
  });

  it("skip saves general without preview step", async () => {
    const user = userEvent.setup();
    renderWithIntl(<LearnerWorldSetup />);

    await user.click(screen.getByRole("button", { name: en.learnerWorld.continue }));
    await user.click(screen.getByRole("button", { name: en.learnerWorld.skipGeneral }));

    expect(saveLearnerWorldAction).toHaveBeenCalledWith("general");
  });
});
