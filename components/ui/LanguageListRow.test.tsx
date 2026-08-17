import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { LanguageListRow } from "@/components/ui/LanguageListRow";

/** Contract: docs/specs/component/language-list-row.md */

describe("LanguageListRow", () => {
  it("matches profile geometry and marks the active language with a chip", () => {
    const { container } = render(<LanguageListRow code="es" isActive activeLabel="Active" />);

    expect(container.firstElementChild?.className).toContain("p-4");
    expect(screen.getByText("Active")).toBeDefined();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("shows standing and a text link to progress", () => {
    render(
      <LanguageListRow
        code="es"
        isActive
        activeLabel="Active"
        standing={{ held: 0, pool: 2000 }}
        standingLabel={(held, pool) => `${held} of ${pool} starter words held stably`}
        viewProgressHref="/progress"
        viewProgressLabel="View on Progress"
      />,
    );

    expect(screen.getByText("0 of 2000 starter words held stably")).toBeDefined();
    const link = screen.getByRole("link", { name: "View on Progress" });
    expect(link.getAttribute("href")).toBe("/progress");
    expect(link.className).not.toContain("bg-accent");
  });

  it("switches when the learner taps a selectable row", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <LanguageListRow code="it" isActive={false} activeLabel="Active" onSelect={onSelect} />,
    );

    await user.click(screen.getByRole("button"));

    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("uses cardPressable on selectable switcher rows", () => {
    render(
      <LanguageListRow code="it" isActive={false} activeLabel="Active" onSelect={() => {}} />,
    );

    const className = screen.getByRole("button").className;
    expect(className).toContain("hover:-translate-y-px");
    expect(className).toContain("active:bg-accent-soft");
    expect(className).toContain("cursor-pointer");
    expect(className).not.toContain("hover:bg-accent-soft");
  });

  it("accepts name overrides for codes outside the learning map", () => {
    render(
      <LanguageListRow
        code="de"
        names={{ endonym: "Deutsch", english: "German" }}
        isActive
        activeLabel="Active"
      />,
    );

    expect(screen.getByText("Deutsch")).toBeDefined();
    expect(screen.getByText("German")).toBeDefined();
    expect(screen.queryByText("de")).toBeNull();
  });
});
