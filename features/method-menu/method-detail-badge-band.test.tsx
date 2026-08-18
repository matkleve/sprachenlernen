import { renderWithIntl as render } from "@/tests/i18n-test-utils";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { loadMethodCatalogue } from "./catalogue";
import { findMethod } from "./MethodDetail";
import { MethodDetailBadgeBand } from "./MethodDetailBadgeBand";

const { catalogue } = loadMethodCatalogue();
const intensiveReading = findMethod(catalogue, "intensive-reading")!;

describe("MethodDetailBadgeBand", () => {
  it("shows effort scale without a separate evidence badge", () => {
    render(<MethodDetailBadgeBand method={intensiveReading} />);

    expect(screen.getByLabelText(/Effort: 3 of 3/i)).toBeDefined();
    expect(screen.queryByText(/Thin evidence/i)).toBeNull();
    expect(screen.getByRole("img", { name: /Reading/i })).toBeDefined();
  });
});
