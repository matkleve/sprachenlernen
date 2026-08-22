import userEvent from "@testing-library/user-event";
import { renderWithIntl, screen, en } from "@/tests/i18n-test-utils";
import { describe, expect, it, vi } from "vitest";

import { LearnerWorldEditor } from "@/features/learner-world/LearnerWorldEditor";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ refresh: vi.fn() })),
}));

vi.mock("@/features/learner-world/actions", () => ({
  saveLearnerWorldFromProfileAction: vi.fn(async () => ({ status: "ok", previousWorldId: "general" })),
}));

import { saveLearnerWorldFromProfileAction } from "@/features/learner-world/actions";

/** Contract: docs/specs/feature/learner-world-setup.md (T-W23) */

describe("LearnerWorldEditor", () => {
  it("shows switch confirmation before saving a new world", async () => {
    const user = userEvent.setup();
    renderWithIntl(<LearnerWorldEditor languageCode="es" currentWorldId="general" />);

    await user.click(screen.getByRole("button", { name: en.learnerWorld.profileAddWorld }));
    await user.click(screen.getByRole("button", { name: en.learnerWorld.world.politics }));

    expect(screen.getByText(en.learnerWorld.switchTitle)).toBeDefined();
    await user.click(screen.getByRole("button", { name: en.learnerWorld.switchConfirm }));

    expect(saveLearnerWorldFromProfileAction).toHaveBeenCalledWith("es", "politics");
  });
});
