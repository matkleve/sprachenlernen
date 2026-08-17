import { renderWithIntl as render, en } from "@/tests/i18n-test-utils";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { loadMethodCatalogue } from "./catalogue";
import { findMethod } from "./MethodDetail";
import { MethodDetailBadgeBand } from "./MethodDetailBadgeBand";

const { catalogue } = loadMethodCatalogue();
const intensiveReading = findMethod(catalogue, "intensive-reading")!;

describe("MethodDetailBadgeBand", () => {
  it("shows plain effort without evidence or dot scale", () => {
    render(<MethodDetailBadgeBand method={intensiveReading} />);

    expect(screen.getByText(en.methodMenu.effortCard[3])).toBeDefined();
    expect(screen.queryByText(en.methodMenu.evidenceCard.B)).toBeNull();
    expect(screen.queryByText(/3 of 3/)).toBeNull();
  });
});
