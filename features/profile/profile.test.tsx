import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProfileLanguages } from "@/features/profile/ProfileLanguages";
import { ProfileSpokenLanguage } from "@/features/profile/ProfileSpokenLanguage";
import { copy } from "@/features/profile/content";
import { SHIPPED_ES_POOL_SIZE } from "@/lib/starter-deck";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/profile"),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

/** Contract: docs/specs/page/profile.md */

const switchTo = vi.fn();

const language = (code: string, isActive: boolean) => ({
  languageCode: code,
  isActive,
  addedAt: "2026-08-11T10:00:00.000Z",
});

describe("ProfileLanguages", () => {
  it("shows the language with its endonym and marks the one in focus", () => {
    render(
      <ProfileLanguages
        outcome={{ status: "ok", languages: [language("es", true)] }}
        switchTo={switchTo}
      />,
    );

    expect(screen.getByText("Español")).toBeDefined();
    expect(screen.getByText("Spanish")).toBeDefined();
    const activeChip = screen.getByText(copy.active);
    expect(activeChip.tagName).toBe("SPAN");
    expect(activeChip.className).toContain("bg-accent-soft");
    expect(activeChip.className).toContain("border-accent");
  });

  it("offers a switch on a language that is not in focus", () => {
    render(
      <ProfileLanguages
        outcome={{ status: "ok", languages: [language("es", true), language("it", false)] }}
        switchTo={switchTo}
      />,
    );

    expect(screen.getAllByRole("button", { name: copy.makeActive })).toHaveLength(1);
  });

  it("routes to the picker instead of rendering an empty table", () => {
    // A learner who has not chosen is not a learner with zero languages, and
    // the difference between those two is a route.
    render(<ProfileLanguages outcome={{ status: "ok", languages: [] }} switchTo={switchTo} />);

    expect(screen.getByText(copy.noneYet)).toBeDefined();
    expect(screen.getByRole("link", { name: copy.chooseFirst })).toBeDefined();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("tells the learner when a switch failed rather than repainting silently", () => {
    render(
      <ProfileLanguages
        outcome={{ status: "ok", languages: [language("es", true)] }}
        switchFailed
        switchTo={switchTo}
      />,
    );

    expect(screen.getByRole("alert").textContent).toBe(copy.switchError);
  });

  it("renders its own failure so the rest of the page survives", () => {
    render(
      <ProfileLanguages outcome={{ status: "error", error: "boom" }} switchTo={switchTo} />,
    );

    expect(screen.getByRole("alert").textContent).toBe(copy.languagesError);
  });

  it("shows a standing line with a link to progress when holdings exist", () => {
    render(
      <ProfileLanguages
        outcome={{ status: "ok", languages: [language("es", true)] }}
        holdings={{ es: { poolSize: SHIPPED_ES_POOL_SIZE, heldCount: 347 } }}
        switchTo={switchTo}
      />,
    );

    expect(screen.getByText(copy.standing(347, SHIPPED_ES_POOL_SIZE))).toBeDefined();
    expect(screen.getByRole("link", { name: copy.viewProgress })).toBeDefined();
  });

  it("shows zero held before the first review when a pool ships", () => {
    render(
      <ProfileLanguages
        outcome={{ status: "ok", languages: [language("it", true)] }}
        holdings={{ it: { poolSize: SHIPPED_ES_POOL_SIZE, heldCount: null } }}
        switchTo={switchTo}
      />,
    );

    expect(screen.getByText(copy.standing(0, SHIPPED_ES_POOL_SIZE))).toBeDefined();
  });

  it("hides Add a language when every shipped pool is already being learned", () => {
    render(
      <ProfileLanguages
        outcome={{ status: "ok", languages: [language("es", true), language("it", false)] }}
        switchTo={switchTo}
      />,
    );

    expect(screen.queryByRole("link", { name: copy.addLanguage })).toBeNull();
  });

  it("shows Add a language when a shipped pool is not on the list yet", () => {
    render(
      <ProfileLanguages
        outcome={{ status: "ok", languages: [language("es", true)] }}
        switchTo={switchTo}
      />,
    );

    expect(screen.getByRole("link", { name: copy.addLanguage })).toBeDefined();
  });

  it("shows no streak, XP, or review total", () => {
    const { container } = render(
      <ProfileLanguages
        outcome={{ status: "ok", languages: [language("es", true)] }}
        switchTo={switchTo}
      />,
    );
    const text = (container.textContent ?? "").toLowerCase();

    expect(text).not.toMatch(/streak|xp|day in a row|cards reviewed/);
    expect(screen.queryByRole("progressbar")).toBeNull();
  });
});

describe("ProfileSpokenLanguage", () => {
  const changeTo = vi.fn();

  it("marks the current spoken language and offers a switch for the other", () => {
    render(
      <ProfileSpokenLanguage
        outcome={{ status: "ok", spokenLanguage: "en" }}
        changeTo={changeTo}
      />,
    );

    expect(screen.getByText("Deutsch")).toBeDefined();
    expect(screen.getAllByText("English").length).toBeGreaterThanOrEqual(1);
    const activeChip = screen.getByText(copy.active);
    expect(activeChip.tagName).toBe("SPAN");
    expect(activeChip.className).toContain("bg-accent-soft");
    expect(activeChip.className).toContain("border-accent");
    expect(screen.getAllByRole("button", { name: copy.makeActive })).toHaveLength(1);
  });
});
