import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { expectNoA11yViolations } from "@/tests/axe";

import { loadMethodCatalogue } from "./catalogue";
import { MethodDetail, findMethod } from "./MethodDetail";
import { copy } from "./content";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

const { catalogue } = loadMethodCatalogue();
const extensiveReading = findMethod(catalogue, "extensive-reading")!;
const srsSession = findMethod(catalogue, "srs-session")!;

describe("MethodDetail", () => {
  it("shows a shipped method", () => {
    render(
      <MethodDetail method={extensiveReading} searchParams={{ minutes: "15", skill: "reading" }} />,
    );

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(extensiveReading.name);
    expect(document.body.textContent).toContain(extensiveReading.doesNotDo);
    expect(screen.queryByRole("link", { name: copy.startSession })).toBeNull();
    expect(screen.getByText(copy.sessionNotBuilt)).toBeDefined();
  });

  it("shows Start for srs-session", () => {
    render(<MethodDetail method={srsSession} />);

    expect(screen.getByRole("link", { name: copy.startSession }).getAttribute("href")).toBe(
      "/words/review?method=srs-session",
    );
  });

  it("preserves filter on back link", () => {
    render(
      <MethodDetail method={extensiveReading} searchParams={{ minutes: "15", skill: "reading" }} />,
    );

    expect(screen.getByRole("link", { name: new RegExp(copy.backToMethods) }).getAttribute("href")).toBe(
      "/methods?minutes=15&skill=reading",
    );
  });

  it("shows not-found for an unknown id", () => {
    render(<MethodDetail method={undefined} />);

    expect(screen.getByText(copy.methodNotFound)).toBeDefined();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<MethodDetail method={extensiveReading} />);
    await expectNoA11yViolations(container);
  });
});
