import { describe, expect, it } from "vitest";

import { buildExportPayload } from "./export";

describe("buildExportPayload", () => {
  const account = { id: "u1", email: "a@example.com" };
  const reviews = [
    {
      id: "r1",
      userId: "u1",
      installationId: "00000000-0000-4000-8000-000000000001",
      taskId: "es:de:meaning-recall",
      grade: "good" as const,
      reviewedAt: "2026-08-10T12:00:00.000Z",
      latencyMs: 400,
      createdAt: "2026-08-10T12:00:00.000Z",
    },
  ];

  it("returns only review_log for reviews scope", () => {
    const payload = buildExportPayload("reviews", account, reviews);
    expect(payload).toEqual({ review_log: reviews });
    expect("account" in payload).toBe(false);
  });

  it("includes account email for complete scope", () => {
    const payload = buildExportPayload("complete", account, reviews);
    expect(payload).toMatchObject({
      account: { email: account.email },
      review_log: reviews,
    });
    expect("exported_at" in payload).toBe(true);
  });
});
