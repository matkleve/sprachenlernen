import { readFileSync } from "node:fs";
import { join } from "node:path";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  commitments,
  filterByContext,
  isMethod,
  type Catalogue,
  type Preset,
} from "@/lib/method-catalogue";
import { expectNoA11yViolations } from "@/tests/axe";

import { MethodMenu } from "./MethodMenu";
import { loadMethodCatalogue } from "./catalogue";
import { copy, evidenceShort, sections } from "./content";

const loaded = loadMethodCatalogue();
const catalogue = loaded.catalogue ?? { entries: [] };
const presets = loaded.presets ?? [];

const show = (
  searchParams: Record<string, string> = {},
  over: { catalogue?: Catalogue; presets?: Preset[] } = {},
) =>
  render(
    <MethodMenu
      catalogue={over.catalogue ?? catalogue}
      presets={over.presets ?? presets}
      searchParams={searchParams}
    />,
  );

const cardTitles = () =>
  screen
    .getAllByRole("listitem")
    .map((li) => li.querySelector("h3"))
    .filter((h): h is HTMLHeadingElement => h !== null)
    .map((h) => h.textContent ?? "");

const presetLink = (name: string) => screen.getByRole("link", { name });

const chosenContext = () =>
  [...screen.getByRole("navigation", { name: copy.contextLabel }).querySelectorAll("[aria-current]")]
    .map((el) => el.textContent);

const methodNames = catalogue.entries.filter(isMethod).map((m) => m.name);

describe("the shipped catalogue reaches the page", () => {
  it("loads with no errors, so the page is never rendering a fallback", () => {
    expect(loaded.errors).toEqual([]);
    expect(methodNames.length).toBeGreaterThan(0);
    expect(presets).toHaveLength(7);
  });
});

describe("with no context chosen", () => {
  it("shows every Method exactly once, with no preset chosen", () => {
    show();

    const titles = cardTitles();
    expect([...titles].sort()).toEqual([...methodNames].sort());
    expect(new Set(titles).size).toBe(titles.length);
    expect(chosenContext()).toEqual([copy.anyContext]);
  });

  it("groups them under their section, one heading per section", () => {
    show();

    const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    const shipped = new Set(catalogue.entries.filter(isMethod).map((m) => m.section));

    expect(shipped.size).toBeGreaterThan(1);
    for (const section of shipped) {
      expect(headings).toContain(sections[section]);
    }
  });
});

describe("choosing a context", () => {
  it("shows only what can be performed there — nothing eyes-free in the kitchen", () => {
    show({ context: "kitchen" });

    const kitchen = presets.find((p) => p.id === "kitchen")!;
    const fitting = filterByContext(catalogue, kitchen.context).map((m) => m.name);

    expect([...cardTitles()].sort()).toEqual([...fitting].sort());
    expect(cardTitles()).not.toContain("Extensive reading at coverage");
  });

  it("marks the chosen preset, and marks no other", () => {
    show({ context: "kitchen" });

    expect(chosenContext()).toEqual([presets.find((p) => p.id === "kitchen")!.name]);
  });

  it("links the chosen preset back to the whole catalogue so tapping it clears the filter", () => {
    show({ context: "kitchen" });

    const kitchen = presets.find((p) => p.id === "kitchen")!;
    expect(presetLink(kitchen.name).getAttribute("href")).toBe("/methods");
  });

  it("offers a way back to the whole catalogue that carries no context", () => {
    show({ context: "kitchen" });

    expect(presetLink(copy.anyContext).getAttribute("href")).toBe("/methods");
  });

  it("leaves no residue when the context is cleared", () => {
    const { unmount } = show({ context: "kitchen" });
    unmount();
    show();

    expect([...cardTitles()].sort()).toEqual([...methodNames].sort());
    expect(chosenContext()).toEqual([copy.anyContext]);
  });

  it("never lists a Commitment, in any context or none", () => {
    const standing = commitments(catalogue).map((c) => c.name);

    for (const context of [{}, ...presets.map((p) => ({ context: p.id }))]) {
      const { unmount } = show(context);
      for (const name of standing) {
        expect(cardTitles(), `${name} must not appear for ${JSON.stringify(context)}`).not.toContain(
          name,
        );
      }
      unmount();
    }
  });
});

describe("skill filter", () => {
  it("narrows to methods that train the chosen skill", () => {
    show({ skill: "reading" });

    const fitting = catalogue.entries
      .filter(isMethod)
      .filter((m) => m.skills.includes("reading"))
      .map((m) => m.name);

    expect([...cardTitles()].sort()).toEqual([...fitting].sort());
  });
});

describe("time filter", () => {
  it("narrows to methods that fit a 2-minute budget", () => {
    show({ time: "2" });

    const fitting = catalogue.entries
      .filter(isMethod)
      .filter((m) => m.durations !== null && Math.min(...m.durations) <= 2)
      .map((m) => m.name);

    expect([...cardTitles()].sort()).toEqual([...fitting].sort());
  });
});

describe("what a card has to say", () => {
  it("states what the Method does not do — on every card, with no exception", () => {
    show();

    const text = document.body.textContent ?? "";
    for (const method of catalogue.entries.filter(isMethod)) {
      expect(text, `${method.name} must say what it does not do`).toContain(method.doesNotDo);
    }
  });

  it("shows the evidence grade as text, including the weak ones", () => {
    show();

    const text = document.body.textContent ?? "";
    for (const method of catalogue.entries.filter(isMethod)) {
      expect(text).toContain(evidenceShort[method.evidence]);
    }
    expect(catalogue.entries.filter(isMethod).some((m) => m.evidence === "D")).toBe(true);
  });

  it("lists a Method the app does not host as a full card that says so", () => {
    show();

    const offApp = catalogue.entries.filter(isMethod).filter((m) => !m.hosted);
    expect(offApp.length).toBeGreaterThan(0);
    for (const method of offApp) {
      expect(cardTitles()).toContain(method.name);
    }
    expect(document.body.textContent).toContain(copy.notHostedShort);
  });

  it("links each hosted card to its session route", () => {
    show();

    const hosted = catalogue.entries.filter(isMethod).find((m) => m.hosted)!;
    const link = screen.getByRole("link", { name: new RegExp(hosted.name) });
    expect(link.getAttribute("href")).toBe(`/words/review?method=${hosted.id}`);
  });

  it("links each off-app card to its detail page", () => {
    show();

    const offApp = catalogue.entries.filter(isMethod).find((m) => !m.hosted)!;
    const link = screen.getByRole("link", { name: new RegExp(offApp.name) });
    expect(link.getAttribute("href")).toBe(`/methods/${offApp.id}`);
  });
});

describe("the states that are not a list of Methods", () => {
  it("names the gap when nothing fits, and renders no Method list", () => {
    const reading = catalogue.entries.find((e) => e.id === "extensive-reading")!;
    const onlyReading: Catalogue = { entries: [reading] };

    show({ context: "kitchen" }, { catalogue: onlyReading });

    expect(screen.getByText(copy.nothingFits)).toBeDefined();
    expect(screen.queryAllByRole("listitem").filter((li) => li.querySelector("h3"))).toHaveLength(0);
  });

  it("says so when the context is not one it ships, rather than filtering silently", () => {
    show({ context: "on-the-moon" });

    expect(screen.getByText(copy.unknownContext)).toBeDefined();
    expect([...cardTitles()].sort()).toEqual([...methodNames].sort());
  });

  it("shows a handled error when the catalogue itself refuses to load", () => {
    render(
      <MethodMenu
        catalogue={undefined}
        presets={presets}
        loadError={{
          userMessage: "Could not load the method catalogue.",
          nextStep: "Refresh the page.",
          referenceId: "abcd1234",
        }}
        searchParams={{}}
      />,
    );

    expect(screen.getByRole("alert").textContent).toContain(
      "Could not load the method catalogue.",
    );
    expect(screen.getByRole("alert").textContent).toContain("Reference: abcd1234");
    expect(document.body.textContent).not.toContain("vocabulary.json");
  });

  it("has no accessibility violations", async () => {
    const { container } = show({ context: "kitchen" });

    await expectNoA11yViolations(container);
  });
});

describe("what this surface is allowed to touch", () => {
  const files = [
    "app/(app)/methods/page.tsx",
    "features/method-menu/MethodMenu.tsx",
    "features/method-menu/MethodCard.tsx",
    "features/method-menu/ContextFilter.tsx",
    "features/method-menu/content.ts",
    "features/method-menu/catalogue.ts",
  ];
  const read = (file: string) => readFileSync(join(process.cwd(), file), "utf8");

  it('has no "use client" anywhere the route can reach', () => {
    for (const file of files) expect(read(file)).not.toContain("use client");
  });

  it("reads nothing about the learner — it never reaches the database", () => {
    for (const file of files) expect(read(file)).not.toContain("@/lib/db");
  });
});
