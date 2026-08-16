import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { loadMethodCatalogue } from "./catalogue";
import { MethodDetail, findMethod } from "./MethodDetail";

const { catalogue } = loadMethodCatalogue();

describe("MethodDetail catalogue coverage", () => {
  const methods = catalogue?.entries.filter((e) => e.type === "method") ?? [];

  it.each(methods.map((m) => m.id))("renders %s without throwing", (id) => {
    const method = findMethod(catalogue, id);
    expect(method).toBeDefined();
    render(<MethodDetail method={method} />);
  });
});
