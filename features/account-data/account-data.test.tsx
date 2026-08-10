import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { expectNoA11yViolations } from "@/tests/axe";

import { AccountDataPanel } from "./AccountDataPanel";
import { copy } from "./content";

vi.mock("@/features/account-data/actions", () => ({
  exportAccountDataAction: vi.fn().mockResolvedValue({
    status: "ok",
    json: '{"review_log":[]}',
  }),
  deleteAccountAction: vi.fn(),
}));

describe("AccountDataPanel", () => {
  it("renders export scope select and download button", () => {
    render(<AccountDataPanel />);
    expect(screen.getByLabelText(copy.scopeLabel)).toBeDefined();
    expect(screen.getByRole("button", { name: copy.download })).toBeDefined();
  });

  it("opens delete confirmation dialog", async () => {
    const user = userEvent.setup();
    render(<AccountDataPanel />);

    await user.click(screen.getByRole("button", { name: copy.deleteAction }));

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText(copy.confirmBody)).toBeDefined();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<AccountDataPanel />);
    await expectNoA11yViolations(container);
  });
});
