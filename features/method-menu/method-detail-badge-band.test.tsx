import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { loadMethodCatalogue } from "./catalogue";
import { effortCard, evidenceCard } from "./content";
import { findMethod } from "./MethodDetail";
import { MethodDetailBadgeBand } from "./MethodDetailBadgeBand";

const { catalogue } = loadMethodCatalogue();
const intensiveReading = findMethod(catalogue, "intensive-reading")!;

describe("MethodDetailBadgeBand", () => {
  it("shows plain effort without evidence or dot scale", () => {
    render(<MethodDetailBadgeBand method={intensiveReading} />);

    expect(screen.getByText(effortCard[3])).toBeDefined();
    expect(screen.queryByText(evidenceCard.B)).toBeNull();
    expect(screen.queryByText(/3 of 3/)).toBeNull();
  });
});
