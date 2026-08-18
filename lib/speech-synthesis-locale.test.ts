import { describe, expect, it } from "vitest";

import { speechSynthesisLocale } from "@/lib/speech-synthesis-locale";

describe("speechSynthesisLocale", () => {
  it("maps shipped learning languages to BCP-47 tags", () => {
    expect(speechSynthesisLocale("es")).toBe("es-ES");
    expect(speechSynthesisLocale("it")).toBe("it-IT");
  });

  it("passes through unknown codes unchanged", () => {
    expect(speechSynthesisLocale("pt-BR")).toBe("pt-BR");
  });
});
