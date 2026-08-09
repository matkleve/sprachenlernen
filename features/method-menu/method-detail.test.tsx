import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { expectNoA11yViolations } from "@/tests/axe";

import { loadMethodCatalogue } from "./catalogue";
import { MethodDetail, findMethod } from "./MethodDetail";
import { copy } from "./content";

const { catalogue } = loadMethodCatalogue();
const method = findMethod(catalogue, "extensive-reading")!;

describe("MethodDetail", () => {
  it("shows a shipped method", () => {
    render(<MethodDetail method={method} searchParams={{ context: "desk" }} />);

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(method.name);
    expect(document.body.textContent).toContain(method.doesNotDo);
    expect(screen.getByRole("link", { name: copy.startSession })).toBeDefined();
    expect(screen.getByRole("link", { name: copy.startSession }).getAttribute("href")).toBe(
      "/words/review?method=extensive-reading",
    );
  });

  it("preserves filter on back link", () => {
    render(<MethodDetail method={method} searchParams={{ context: "desk" }} />);

    expect(screen.getByRole("link", { name: new RegExp(copy.backToMethods) }).getAttribute("href")).toBe(
      "/methods?context=desk",
    );
  });

  it("shows not-found for an unknown id", () => {
    render(<MethodDetail method={undefined} />);

    expect(screen.getByText(copy.methodNotFound)).toBeDefined();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<MethodDetail method={method} />);
    await expectNoA11yViolations(container);
  });
});
