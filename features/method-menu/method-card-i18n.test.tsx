import { renderWithIntlDe, screen } from "@/tests/i18n-test-utils";
import { describe, expect, it } from "vitest";

import de from "@/messages/de.json";
import { loadMethodCatalogue } from "@/features/method-menu/catalogue";
import { findMethod } from "@/features/method-menu/MethodDetail";
import { MethodCard } from "@/features/method-menu/MethodCard";

const { catalogue } = loadMethodCatalogue();
const backgroundListening = findMethod(catalogue, "background-listening")!;

describe("MethodCard locale", () => {
  it("shows German catalogue copy when locale is de", () => {
    renderWithIntlDe(<MethodCard method={backgroundListening} />);

    expect(
      screen.getByRole("heading", {
        level: 3,
        name: de.methodMenu.entries["background-listening"].name,
      }),
    ).toBeDefined();
    expect(screen.queryByText(backgroundListening.name)).toBeNull();
    expect(
      screen.getByText(de.methodMenu.entries["background-listening"].doesNotDo, { exact: false }),
    ).toBeDefined();
  });
});
