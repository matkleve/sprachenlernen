import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CardReportPopover } from "@/features/review-session/CardReportPopover";
import { copy } from "@/features/review-session/content";

describe("SPEC-feature-review-card-report", () => {
  it("submits with no optional fields when Report is tapped", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const triggerRef = { current: document.createElement("button") };

    render(
      <CardReportPopover
        open
        onClose={() => {}}
        onSubmit={onSubmit}
        triggerRef={triggerRef}
      />,
    );

    await user.click(screen.getByRole("button", { name: copy.reportSubmit }));

    expect(onSubmit).toHaveBeenCalledWith({ category: null, note: null });
  });

  it("passes the selected category and trimmed note", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const triggerRef = { current: document.createElement("button") };

    render(
      <CardReportPopover
        open
        onClose={() => {}}
        onSubmit={onSubmit}
        triggerRef={triggerRef}
      />,
    );

    await user.click(screen.getByRole("button", { name: copy.reportCategories.confusing }));
    await user.type(screen.getByRole("textbox"), "  Two meanings shown  ");
    await user.click(screen.getByRole("button", { name: copy.reportSubmit }));

    expect(onSubmit).toHaveBeenCalledWith({
      category: "confusing",
      note: "Two meanings shown",
    });
  });
});
