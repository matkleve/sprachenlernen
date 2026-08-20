import { renderWithIntl as render, en } from "@/tests/i18n-test-utils";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { loadMethodCatalogue } from "./catalogue";
import { findMethod } from "./MethodDetail";
import { MethodMaterialSetup } from "./MethodMaterialSetup";
import type { MaterialSetupContext } from "@/lib/method-material-setup";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("./material-setup-actions", () => ({
  previewOwnMaterialAction: vi.fn(),
  startMaterialPracticeAction: vi.fn().mockResolvedValue({
    status: "ok",
    href: "/practice?method=partial-dictation&sourceId=learner-1",
  }),
}));

const { catalogue } = loadMethodCatalogue();
const extensiveReading = findMethod(catalogue, "extensive-reading")!;
const partialDictation = findMethod(catalogue, "partial-dictation")!;
const srsSession = findMethod(catalogue, "srs-session")!;

const baseContext: MaterialSetupContext = {
  topicChips: [
    { id: "app-pick", label: "App picks", disabled: false },
    { id: "news", label: "News", disabled: false },
    { id: "daily", label: "Daily life", disabled: false },
    { id: "own", label: "Your own", disabled: false },
  ],
  unitOptions: [
    { id: "sentence", label: "One sentence" },
    { id: "window", label: "5 min listening", durationSec: 300 },
  ],
  defaultTopicId: "app-pick",
  defaultUnitId: "sentence",
  previews: {
    "app-pick": {
      sentence: {
        sourceId: "es-fixture-cafe",
        title: "En el café",
        coverage: {
          coveragePercent: 96,
          tokenCount: 10,
          knownCount: 9,
          comfortBand: "comfortable",
        },
        unitId: "sentence",
        unitLabel: "One sentence",
        timeLabel: "~8 min",
      },
    },
    news: {
      sentence: {
        sourceId: "wikinews-es-3516",
        title: "Noticias: elecciones en Chile",
        coverage: {
          coveragePercent: 93,
          tokenCount: 12,
          knownCount: 11,
          comfortBand: "demanding",
        },
        unitId: "sentence",
        unitLabel: "One sentence",
        timeLabel: "~8 min",
        startEnabled: true,
      },
    },
  },
};

describe("MethodMaterialSetup", () => {
  it("renders Start directly below topic chips", () => {
    const { container } = render(
      <MethodMaterialSetup method={extensiveReading} context={baseContext} />,
    );

    const topicHeading = screen.getByRole("heading", { name: en.methodMaterial.topicHeading });
    const start = screen.getByRole("link", { name: en.methodMenu.startSession });

    expect(topicHeading.compareDocumentPosition(start)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(
      Array.from(container.querySelectorAll("button, a")).indexOf(start) >
        Array.from(container.querySelectorAll("button")).findIndex((el) =>
          el.textContent?.includes("News"),
        ),
    ).toBe(true);
  });

  it("AC-1: renders topic chips for methods with materialTopics", () => {
    render(<MethodMaterialSetup method={extensiveReading} context={baseContext} />);

    expect(screen.getByRole("button", { name: "App picks" })).toBeDefined();
    expect(screen.getByRole("button", { name: "News" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Your own" })).toBeDefined();
  });

  it("AC-3: news chip shows catalogue preview and enabled Start without upload UI", async () => {
    const user = userEvent.setup();
    render(<MethodMaterialSetup method={partialDictation} context={baseContext} />);

    await user.click(screen.getByRole("button", { name: "News" }));

    expect(screen.getByText("Noticias: elecciones en Chile")).toBeDefined();
    expect(screen.getByText(/93% known/i)).toBeDefined();
    expect(screen.queryByPlaceholderText(/paste or type/i)).toBeNull();
    expect(screen.getByRole("link", { name: en.methodMenu.startSession }).getAttribute("href")).toContain(
      "sourceId=wikinews-es-3516",
    );
  });

  it("AC-4: your own reveals intake controls and hides catalogue preview", async () => {
    const user = userEvent.setup();
    render(<MethodMaterialSetup method={partialDictation} context={baseContext} />);

    await user.click(screen.getByRole("button", { name: "Your own" }));

    expect(screen.getByPlaceholderText(/paste or type/i)).toBeDefined();
    expect(screen.getByRole("button", { name: "Upload file" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Link" })).toBeDefined();
    expect(screen.queryByText("En el café")).toBeNull();
  });

  it("AC-5: own paste preview shows demanding copy before Start enables", async () => {
    const user = userEvent.setup();
    render(
      <MethodMaterialSetup
        method={partialDictation}
        context={baseContext}
        previewOwnForTest={() => ({
          sourceId: "learner-1",
          title: "Your text",
          coverage: {
            coveragePercent: 78,
            tokenCount: 20,
            knownCount: 15,
            comfortBand: "demanding",
          },
          unitId: "sentence",
          unitLabel: "One sentence",
          timeLabel: "~1 min",
          demandingCopy: "Still demanding — 4 words to comfortable",
        })}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Your own" }));
    await user.type(screen.getByPlaceholderText(/paste or type/i), "Hola");

    expect(await screen.findByText(/Still demanding/i)).toBeDefined();
    expect(screen.getByRole("button", { name: en.methodMenu.startSession }).getAttribute("disabled")).toBeNull();
  });

  it("AC-6: disabled topic chip cannot be selected", () => {
    const context: MaterialSetupContext = {
      ...baseContext,
      topicChips: [
        ...baseContext.topicChips.slice(0, 3),
        { id: "environment", label: "Environment", disabled: true, emptyReason: "Nothing yet" },
        baseContext.topicChips[3]!,
      ],
    };

    render(<MethodMaterialSetup method={partialDictation} context={context} />);
    expect(screen.getByRole("button", { name: "Environment" }).getAttribute("disabled")).not.toBeNull();
  });

  it("AC-10: disables Start when personal delivery gate blocks", async () => {
    const user = userEvent.setup();
    const context: MaterialSetupContext = {
      ...baseContext,
      previews: {
        ...baseContext.previews,
        news: {
          sentence: {
            sourceId: "wikinews-es-3516",
            title: "Egypt elections",
            coverage: {
              coveragePercent: 55,
              tokenCount: 20,
              knownCount: 11,
              comfortBand: "demanding",
            },
            unitId: "sentence",
            unitLabel: "One sentence",
            timeLabel: "~1 min",
            adapted: true,
            targetLevel: "A2",
            sourceUrl: "https://example.com/original",
            adaptationLabel: "Adapted for A2 · not the original article",
            deliveryGate: "blocked",
            startEnabled: false,
            demandingCopy: "Too hard for your vocabulary",
          },
        },
      },
    };

    render(<MethodMaterialSetup method={extensiveReading} context={context} />);
    await user.click(screen.getByRole("button", { name: "News" }));

    expect(screen.getByText(/Adapted for A2/i)).toBeDefined();
    expect(screen.getByRole("link", { name: en.methodMaterial.viewOriginal })).toBeDefined();
    expect(screen.queryByRole("link", { name: en.methodMenu.startSession })).toBeNull();
    expect(screen.getByRole("button", { name: en.methodMenu.startSession }).hasAttribute("disabled")).toBe(
      true,
    );
  });

  it("AC-8: shows unit chips and preview label for partial dictation", () => {
    render(<MethodMaterialSetup method={partialDictation} context={baseContext} />);

    expect(screen.getByRole("button", { name: "One sentence" })).toBeDefined();
    expect(screen.getByRole("button", { name: "5 min listening" })).toBeDefined();
    expect(screen.getByText(/One sentence · 96% known/i)).toBeDefined();
  });

  it("does not render for methods without materialTopics in parent", () => {
    expect(srsSession.materialTopics).toBeUndefined();
  });
});

describe("MethodDetail material setup integration", () => {
  it("AC-2: srs-session detail has no topic chip row", async () => {
    const { MethodDetail } = await import("./MethodDetail");
    render(await MethodDetail({ method: srsSession }));
    expect(screen.queryByRole("heading", { name: /topic/i })).toBeNull();
  });
});
