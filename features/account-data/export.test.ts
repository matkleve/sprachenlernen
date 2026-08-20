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

describe("buildExportPayload — completeness (UC-024)", () => {
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

  const rest = {
    taskStates: [
      {
        taskId: "es:de:meaning-recall",
        wordId: "es:de",
        state: "review" as const,
        stability: 6.1,
        difficulty: 5,
        due: "2026-08-20T00:00:00.000Z",
        lastReviewAt: "2026-08-10T12:00:00.000Z",
        lapses: 0,
        lastGrade: "good" as const,
        reviewCount: 3,
        weightsVersion: "fsrs-v1",
      },
    ],
    sources: [
      {
        id: "s1",
        languageCode: "es",
        kind: "text" as const,
        title: "Una mañana",
        body: "Una mañana de verano.",
        origin: "learner" as const,
        addedAt: "2026-08-11T00:00:00.000Z",
        ephemeral: false as const,
      },
    ],
    flags: [
      {
        wordId: "es:de",
        spokenLanguage: "en",
        category: "wrong-translation",
        note: "the gloss is off",
        flaggedAt: "2026-08-12T00:00:00.000Z",
      },
    ],
    languages: [{ languageCode: "es", isActive: true, addedAt: "2026-08-01T00:00:00.000Z" }],
    spokenLanguage: "de",
  };

  /**
   * UC-024's success condition is "one action exports everything … complete
   * enough that the schedule could be rebuilt elsewhere". A complete archive
   * that carried the review log and the email alone left the learner's
   * scheduler state, their own saved texts, their reports and their language
   * settings on the server with no way to take them along.
   */
  it("carries every learner-owned table in the complete archive", () => {
    const payload = buildExportPayload("complete", account, reviews, rest);

    expect(payload).toMatchObject({
      account: { email: account.email, spoken_language: "de" },
      review_log: reviews,
      task_state: rest.taskStates,
      content_sources: rest.sources,
      card_content_flag: rest.flags,
      learner_language: rest.languages,
    });
  });

  it("keeps the learner's free-text note — it is their writing, not app data", () => {
    const payload = buildExportPayload("complete", account, reviews, rest);
    expect(JSON.stringify(payload)).toContain("the gloss is off");
  });

  it("still narrows to the review log alone when that scope is chosen", () => {
    const payload = buildExportPayload("reviews", account, reviews, rest);
    expect(payload).toEqual({ review_log: reviews });
  });
});
