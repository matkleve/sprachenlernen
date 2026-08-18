import { renderWithIntl as render, en } from "@/tests/i18n-test-utils";
import { screen, within } from "@testing-library/react";

import { describe, expect, it, vi } from "vitest";

import { expectNoA11yViolations } from "@/tests/axe";

import { loadMethodCatalogue } from "./catalogue";
import { MethodDetail, findMethod } from "./MethodDetail";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

const { catalogue } = loadMethodCatalogue();
const extensiveReading = findMethod(catalogue, "extensive-reading")!;
const intensiveReading = findMethod(catalogue, "intensive-reading")!;
const narrowListening = findMethod(catalogue, "narrow-listening")!;
const backgroundListening = findMethod(catalogue, "background-listening")!;
const srsSession = findMethod(catalogue, "srs-session")!;

describe("MethodDetail", () => {
  it("shows effort dots in the badge band", async () => {
    render(await MethodDetail({ method: intensiveReading }));

    expect(screen.getByLabelText(/Effort: 3 of 3/i)).toBeDefined();
  });

  it("shows effort anchor sentence in practical details", async () => {
    render(await MethodDetail({ method: intensiveReading }));

    expect(document.body.textContent).toContain(en.methodMenu.intensity[3]);
  });

  it("shows a single duration chip in the facts panel", async () => {
    render(await MethodDetail({ method: narrowListening }));
    expect(screen.getAllByText("10–45 min").length).toBeGreaterThan(0);
  });

  it("shows skill tier badges for improving skills", async () => {
    render(await MethodDetail({ method: narrowListening }));

    expect(
      screen.getByRole("img", {
        name: `Gold ${en.methodMenu.skillLabels.listening}`,
      }),
    ).toBeDefined();
  });

  it("places summary before the badge band and keeps evidence out of the band", async () => {
    render(await MethodDetail({ method: narrowListening }));

    const heading = screen.getByRole("heading", { level: 1, name: narrowListening.name });
    const summary = heading.nextElementSibling;
    expect(summary?.textContent).toBe(narrowListening.summary);

    const band = summary?.nextElementSibling;
    expect(band).toBeTruthy();
    expect(within(band as HTMLElement).queryByText(en.methodMenu.evidenceCard.B)).toBeNull();
  });

  it("shows wood tier shields on detail for weak methods", async () => {
    render(await MethodDetail({ method: backgroundListening }));

    expect(
      screen.getByRole("img", {
        name: `Wood ${en.methodMenu.skillLabels.listening}`,
      }),
    ).toBeDefined();
  });

  it("shows article prose for a shipped method", async () => {
    render(
      await MethodDetail({
        method: extensiveReading,
        searchParams: { minutes: "15", skill: "reading" },
      }),
    );

    expect(screen.getByRole("heading", { level: 1, name: extensiveReading.name })).toBeDefined();
    expect(document.body.textContent).toContain(extensiveReading.summary);
    expect(document.body.textContent).toContain(extensiveReading.trains);
    expect(document.body.textContent).toContain(extensiveReading.doesNotDo);
    expect(screen.queryByRole("link", { name: en.methodMenu.startSession })).toBeNull();
    expect(screen.getByText(en.methodMenu.sessionNotBuilt)).toBeDefined();
  });

  it("uses the same section graphic as cards in a full-bleed hero", async () => {
    render(await MethodDetail({ method: extensiveReading }));

    const hero = document.querySelector(".w-screen");
    expect(hero).not.toBeNull();
    expect(hero?.textContent).toContain(en.methodMenu.sections.reading);
  });

  it("shows Start for srs-session", async () => {
    render(await MethodDetail({ method: srsSession }));

    expect(screen.getByRole("link", { name: en.methodMenu.startSession }).getAttribute("href")).toBe(
      "/words/review?method=srs-session",
    );
  });

  it("shows Start for partial-dictation on practice", async () => {
    const partialDictation = findMethod(catalogue, "partial-dictation")!;
    render(await MethodDetail({ method: partialDictation }));

    expect(screen.getByRole("link", { name: en.methodMenu.startSession }).getAttribute("href")).toBe(
      "/practice?method=partial-dictation",
    );
    expect(screen.queryByText(en.methodMenu.sessionNotBuilt)).toBeNull();
  });

  it("preserves filter on back link", async () => {
    render(
      await MethodDetail({
        method: extensiveReading,
        searchParams: { minutes: "15", skill: "reading" },
      }),
    );

    const back = screen.getByRole("link", { name: new RegExp(en.methodMenu.backToMethods) });
    expect(back.getAttribute("href")).toBe("/methods?minutes=15&skill=reading");
    expect(back.className).toContain("hidden");
    expect(back.className).toContain("md:inline-flex");
  });

  it("shows not-found for an unknown id", async () => {
    render(await MethodDetail({ method: undefined }));

    expect(screen.getByText(en.methodMenu.methodNotFound)).toBeDefined();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(await MethodDetail({ method: extensiveReading }));
    await expectNoA11yViolations(container);
  });
});
