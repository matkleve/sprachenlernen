import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CardReportPopover } from "@/features/review-session/CardReportPopover";
import { renderWithIntl, renderWithIntlDe, screen } from "@/tests/i18n-test-utils";

describe("SPEC-feature-review-card-report", () => {
  it("submits with no optional fields when Report is tapped", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const triggerRef = { current: document.createElement("button") };

    renderWithIntl(
      <CardReportPopover
        open
        onClose={() => {}}
        onSubmit={onSubmit}
        triggerRef={triggerRef}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Report" }));

    expect(onSubmit).toHaveBeenCalledWith({ category: null, note: null });
  });

  it("passes the selected category and trimmed note", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const triggerRef = { current: document.createElement("button") };

    renderWithIntl(
      <CardReportPopover
        open
        onClose={() => {}}
        onSubmit={onSubmit}
        triggerRef={triggerRef}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Confusing" }));
    await user.type(screen.getByRole("textbox"), "  Two meanings shown  ");
    await user.click(screen.getByRole("button", { name: "Report" }));

    expect(onSubmit).toHaveBeenCalledWith({
      category: "confusing",
      note: "Two meanings shown",
    });
  });

  it("renders German chrome when locale is de", () => {
    const triggerRef = { current: document.createElement("button") };

    renderWithIntlDe(
      <CardReportPopover
        open
        onClose={() => {}}
        onSubmit={vi.fn()}
        triggerRef={triggerRef}
      />,
    );

    expect(screen.getByRole("heading", { name: "Diese Karte melden" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Melden" })).toBeDefined();
  });
});
