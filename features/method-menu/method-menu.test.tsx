import { readFileSync } from "node:fs";
import { join } from "node:path";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { commitments, isMethod, type Catalogue } from "@/lib/method-catalogue";
import { expectNoA11yViolations } from "@/tests/axe";

import { MethodMenu } from "./MethodMenu";
import { loadMethodCatalogue } from "./catalogue";
import { copy, evidenceShort, sections } from "./content";

const loaded = loadMethodCatalogue();
const catalogue = loaded.catalogue ?? { entries: [] };

const show = (
  searchParams: Record<string, string> = {},
  over: { catalogue?: Catalogue } = {},
) =>
  render(
    <MethodMenu catalogue={over.catalogue ?? catalogue} searchParams={searchParams} />,
  );

const cardTitles = () =>
  screen
    .getAllByRole("listitem")
    .map((li) => li.querySelector("h3"))
    .filter((h): h is HTMLHeadingElement => h !== null)
    .map((h) => h.textContent ?? "");

const methodNames = catalogue.entries.filter(isMethod).map((m) => m.name);

describe("with no filter", () => {
  it("shows every Method exactly once", () => {
    show();
    const titles = cardTitles();
    expect([...titles].sort()).toEqual([...methodNames].sort());
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
    expect(screen.getByRole("slider", { name: copy.timeLabel })).toBeDefined();
  });
});

describe("cards", () => {
  it("links hosted methods to session", () => {
    show();
    const hosted = catalogue.entries.filter(isMethod).find((m) => m.hosted)!;
    const link = screen.getByRole("link", { name: new RegExp(hosted.name) });
    expect(link.getAttribute("href")).toContain("/words/review");
  });

  it("states doesNotDo on every card", () => {
    show();
    const text = document.body.textContent ?? "";
    for (const method of catalogue.entries.filter(isMethod)) {
      expect(text).toContain(method.doesNotDo);
    }
  });

  it("shows evidence as text", () => {
    show();
    const text = document.body.textContent ?? "";
    for (const method of catalogue.entries.filter(isMethod)) {
      expect(text).toContain(evidenceShort[method.evidence]);
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
  const files = [
    "features/method-menu/MethodMenu.tsx",
    "features/method-menu/MethodCard.tsx",
    "features/method-menu/MethodFilter.tsx",
  ];
  it('has no "use client" on the menu shell', () => {
    for (const file of files) {
      expect(readFileSync(join(process.cwd(), file), "utf8")).not.toContain("use client");
    }
  });
});
