import { renderWithIntl as render, en } from "@/tests/i18n-test-utils";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { FormErrorExplanation } from "@/features/review-session/FormErrorExplanation";

describe("FormErrorExplanation", () => {
  it("shows the rule when expanded", async () => {
    const user = userEvent.setup();
    render(
      <FormErrorExplanation
        explanation={{
          ruleKey: "formRules.es.verb1.ind.pres",
          exampleSurfaces: ["hablo"],
        }}
      />,
    );

    await user.click(screen.getByText(en.reviewSession.formExplanationSummary));

    expect(screen.getByText(/-ar verbs in the present/i)).toBeDefined();
    expect(screen.getByText(/Examples: hablo/i)).toBeDefined();
  });
});
