import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { OptionButton } from "./OptionButton";

describe("OptionButton", () => {
  it("renders a full-width row option unselected", () => {
    render(<OptionButton layout="row">Quiet place</OptionButton>);
    const button = screen.getByRole("button", { name: "Quiet place" });
    expect(button.className).toContain("w-full");
    expect(button.className).toContain("justify-start");
    expect(button.getAttribute("aria-pressed")).toBe("false");
    expect(button.className).toContain("border-line");
  });

  it("renders selected row option as primary", () => {
    render(
      <OptionButton layout="row" selected>
        Quiet place
      </OptionButton>,
    );
    const button = screen.getByRole("button", { name: "Quiet place" });
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(button.className).toContain("bg-accent");
  });

  it("uses radio semantics when selectionMode is radio", () => {
    render(
      <OptionButton layout="row" selectionMode="radio" selected>
        Answer A
      </OptionButton>,
    );
    const option = screen.getByRole("radio", { name: "Answer A" });
    expect(option.getAttribute("aria-checked")).toBe("true");
    expect(option.getAttribute("aria-pressed")).toBeNull();
  });

  it("toggles via click handler", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <OptionButton layout="chip" onClick={onClick}>
        token
      </OptionButton>,
    );
    await user.click(screen.getByRole("button", { name: "token" }));
    expect(onClick).toHaveBeenCalled();
  });
});
