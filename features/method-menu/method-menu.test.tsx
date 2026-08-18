import { readFileSync } from "node:fs";
import { join } from "node:path";

import { renderWithIntl as render, formatMessage, en } from "@/tests/i18n-test-utils";
import {screen, within} from "@testing-library/react";

import { describe, expect, it } from "vitest";

import { commitments, isMethod, type Catalogue } from "@/lib/method-catalogue";
import { expectNoA11yViolations } from "@/tests/axe";

import { MethodMenu } from "./MethodMenu";
import { loadMethodCatalogue } from "./catalogue";
import { findMethod } from "./MethodDetail";

const loaded = loadMethodCatalogue();
const catalogue = loaded.catalogue ?? { entries: [] };

const show = (
  searchParams: Record<string, string> = {},
  over: { catalogue?: Catalogue; dayKey?: string } = {},
) =>
  render(
    <MethodMenu
      catalogue={over.catalogue ?? catalogue}
      initialSearchParams={searchParams}
      dayKey={over.dayKey}
    />,
  );

const catalogueCardTitles = () => {
  const titles: string[] = [];
  for (const sectionName of Object.values(en.methodMenu.sections)) {
    const heading = screen.queryByRole("heading", { level: 2, name: sectionName });
    const section = heading?.closest("section");
    if (!section) continue;
    for (const item of within(section).getAllByRole("listitem")) {
      const name = item.querySelector("h3")?.textContent;
      if (name) titles.push(name);
    }
  }
  return titles;
};

const cardTitles = catalogueCardTitles;

const methodNames = catalogue.entries.filter(isMethod).map((m) => m.name);

describe("with no filter", () => {
  it("shows every Method exactly once in the catalogue sections", () => {
    show();
    const titles = cardTitles();
    expect([...titles].sort()).toEqual([...methodNames].sort());
  });

  it("shows three daily picks", () => {
    show({}, { dayKey: "2026-08-11" });
    const heading = screen.getByRole("heading", { level: 2, name: en.methodMenu.dailyHeading });
    const list = heading.closest("section")?.querySelector(":scope > ul");
    expect(list?.children).toHaveLength(3);
    expect(screen.getByText(en.methodMenu.dailyIntro)).toBeDefined();
  });
});

describe("filters", () => {
  it("narrows by minutes", () => {
    show({ minutes: "2" });
    const fitting = catalogue.entries
      .filter(isMethod)
      .filter((m) => m.durations !== null && Math.min(...m.durations) <= 2)
      .map((m) => m.name);
    expect([...cardTitles()].sort()).toEqual([...fitting].sort());
  });

  it("narrows by skill", () => {
    show({ skill: "reading" });
    const fitting = catalogue.entries
      .filter(isMethod)
      .filter((m) => m.skills.includes("reading"))
      .map((m) => m.name);
    expect([...cardTitles()].sort()).toEqual([...fitting].sort());
  });

  it("shows time slider", () => {
    show();
    expect(screen.getByRole("slider", { name: en.methodMenu.timeLabel })).toBeDefined();
  });
});

describe("cards", () => {
  it("links srs-session to Words review", () => {
    show();
    const srs = catalogue.entries.filter(isMethod).find((m) => m.id === "srs-session")!;
    const link = screen.getByRole("link", { name: new RegExp(srs.name) });
    expect(link.getAttribute("href")).toBe("/words/review?method=srs-session");
  });

  it("links hosted methods with built runners to practice", () => {
    show();
    const hosted = findMethod(catalogue, "extensive-reading")!;
    const link = screen.getByRole("link", { name: new RegExp(hosted.name) });
    expect(link.getAttribute("href")).toContain("/practice?method=extensive-reading");
    expect(link.getAttribute("href")).not.toContain("/words/review");
  });

  it("links other hosted methods without a runner to detail", () => {
    show();
    const hosted = findMethod(catalogue, "narrow-listening")!;
    const link = screen.getByRole("link", { name: new RegExp(hosted.name) });
    expect(link.getAttribute("href")).toContain(`/methods/${hosted.id}`);
    expect(link.getAttribute("href")).not.toContain("/words/review");
  });

  it("states doesNotDo on every card", () => {
    show();
    const text = document.body.textContent ?? "";
    for (const method of catalogue.entries.filter(isMethod)) {
      expect(text).toContain(method.doesNotDo);
    }
  });

  it("shows effort on every card", () => {
    show();
    const text = document.body.textContent ?? "";
    for (const method of catalogue.entries.filter(isMethod)) {
      expect(text).toContain(en.methodMenu.card.effort);
      expect(text).not.toContain(en.methodMenu.evidenceCard[method.evidence]);
    }
  });
});

describe("commitments and a11y", () => {
  it("never lists commitments", () => {
    const standing = commitments(catalogue).map((c) => c.name);
    show();
    for (const name of standing) {
      expect(cardTitles()).not.toContain(name);
    }
  });

  it("has no accessibility violations", async () => {
    const { container } = show({ minutes: "15", skill: "reading" });
    await expectNoA11yViolations(container);
  });
});

describe("server component boundary", () => {
  it('keeps the route thin — page.tsx has no "use client"', () => {
    const page = readFileSync(join(process.cwd(), "app/(app)/methods/page.tsx"), "utf8");
    expect(page).not.toContain("use client");
  });

  it("uses MethodMenu as the client island for instant filtering", () => {
    const menu = readFileSync(join(process.cwd(), "features/method-menu/MethodMenu.tsx"), "utf8");
    expect(menu).toContain("use client");
    expect(menu).toContain("useMenuFilter");
  });
});
