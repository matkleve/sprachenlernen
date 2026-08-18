import { renderWithIntl as render } from "@/tests/i18n-test-utils";
import { describe, expect, it } from "vitest";

import { SessionRunStatusStrip } from "./SessionRunStatusStrip";

describe("SessionRunStatusStrip", () => {
  it("stretches segments across the full strip width", () => {
    const { container } = render(
      <SessionRunStatusStrip
        segments={[
          { taskId: "a", status: "done" },
          { taskId: "b", status: "current" },
          { taskId: "c", status: "pending" },
        ]}
      />,
    );

    const segments = container.querySelectorAll("[role='listitem']");
    expect(segments.length).toBe(3);
    for (const segment of segments) {
      expect(segment.className).toContain("flex-1");
      expect(segment.className).not.toContain("w-2");
    }
  });
});
