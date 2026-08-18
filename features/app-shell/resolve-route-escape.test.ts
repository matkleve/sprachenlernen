import { describe, expect, it } from "vitest";

import {
  routeEscapeDestination,
  routeEscapeHref,
} from "@/features/app-shell/resolve-route-escape";

describe("resolve-route-escape", () => {
  it("maps drill-in routes to their destination root", () => {
    expect(routeEscapeHref("/words/review")).toBe("/words");
    expect(routeEscapeHref("/methods/srs-session")).toBe("/methods");
    expect(routeEscapeDestination("/words/review")).toBe("words");
    expect(routeEscapeDestination("/methods/srs-session")).toBe("methods");
  });

  it("maps destination roots to themselves", () => {
    expect(routeEscapeHref("/progress")).toBe("/progress");
    expect(routeEscapeDestination("/progress")).toBe("progress");
  });

  it("maps content drill-in to the library", () => {
    expect(routeEscapeHref("/content/ep-1")).toBe("/content");
    expect(routeEscapeDestination("/content/ep-1")).toBe("content");
  });

  it("strips query strings before resolving", () => {
    expect(routeEscapeHref("/profile?section=data")).toBe("/profile");
    expect(routeEscapeDestination("/profile?section=data")).toBe("profile");
  });

  it("falls back to Methods for unknown paths", () => {
    expect(routeEscapeHref("/languages/choose")).toBe("/methods");
    expect(routeEscapeDestination("/languages/choose")).toBeNull();
  });
});
