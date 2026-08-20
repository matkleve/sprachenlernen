/**
 * Contract: docs/specs/service/form-practice.md (taskId shape)
 */
import { describe, expect, it } from "vitest";

import {
  buildFormCellTaskId,
  isFormCellTaskId,
  parseFormCellTaskId,
} from "@/lib/form-cell-task-id";

describe("form-cell-task-id", () => {
  it("builds and parses a cell-based form-recall task id", () => {
    const taskId = buildFormCellTaskId("es", "hablar", "verb", "ind.pres.1pl");
    expect(taskId).toBe("es:hablar:verb:ind.pres.1pl:form-recall");
    expect(parseFormCellTaskId(taskId)).toEqual({
      languageCode: "es",
      lemma: "hablar",
      pos: "verb",
      cell: "ind.pres.1pl",
    });
    expect(isFormCellTaskId(taskId)).toBe(true);
  });

  it("does not treat legacy surface-form ids as cell ids", () => {
    expect(isFormCellTaskId("es:hablar:habla:form-recall")).toBe(false);
    expect(parseFormCellTaskId("es:hablar:habla:form-recall")).toBeNull();
  });
});
