import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { LanguageSwitchRow } from "@/components/ui/LanguageSwitchRow";

/** Contract: docs/specs/component/language-switch-row.md */

describe("LanguageSwitchRow", () => {
  it("marks the active language with a chip and no switch control", () => {
    render(<LanguageSwitchRow code="es" isActive activeLabel="Active" />);

    expect(screen.getByText("Español")).toBeDefined();
    expect(screen.getByText("Active")).toBeDefined();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("switches when the learner picks a non-active row", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<LanguageSwitchRow code="it" isActive={false} activeLabel="Active" onSelect={onSelect} />);

    await user.click(screen.getByRole("button"));

    expect(onSelect).toHaveBeenCalledWith("it");
  });
});
