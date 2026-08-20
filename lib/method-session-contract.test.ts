/**
 * Contract: docs/specs/service/method-session-viability.md
 */
import { describe, expect, it } from "vitest";

import { loadMethodCatalogue } from "@/features/method-menu/catalogue";
import { findMethod } from "@/features/method-menu/MethodDetail";
import {
  detectFeedbackMode,
  resolveSessionContract,
  volumeLabelKeyForMethod,
} from "@/lib/method-session-contract";

const { catalogue } = loadMethodCatalogue();

describe("resolveSessionContract", () => {
  it("returns honest-none feedback for build-a-sentence at 8 min", async () => {
    const method = findMethod(catalogue, "build-a-sentence")!;
    const contract = await resolveSessionContract(method, 8);

    expect(contract).not.toBeNull();
    expect(contract!.learningUnits).toBeGreaterThanOrEqual(3);
    expect(contract!.feedbackMode).toBe("honest-none");
    expect(contract!.feedbackLabelKey).toBe("sessionFeedbackHonestNone");
    expect(contract!.volumeLabelKey).toBe("sessionVolumeWords");
  });

  it("returns self-mark feedback for partial-dictation at 8 min", async () => {
    const method = findMethod(catalogue, "partial-dictation")!;
    const contract = await resolveSessionContract(method, 8);

    expect(contract).not.toBeNull();
    expect(contract!.learningUnits).toBeGreaterThanOrEqual(3);
    expect(contract!.feedbackMode).toBe("self-mark");
    expect(contract!.volumeLabelKey).toBe("sessionVolumeSentences");
  });

  it("returns fixed 15 cards for srs-session", async () => {
    const method = findMethod(catalogue, "srs-session")!;
    const contract = await resolveSessionContract(method);

    expect(contract).not.toBeNull();
    expect(contract!.learningUnits).toBe(15);
    expect(contract!.volumeLabelKey).toBe("sessionVolumeCards");
  });

  it("returns null for unhosted methods", async () => {
    const method = findMethod(catalogue, "intensive-reading")!;
    expect(await resolveSessionContract(method, 15)).toBeNull();
  });
});

describe("detectFeedbackMode", () => {
  it("maps volume labels by method id", () => {
    expect(volumeLabelKeyForMethod("build-a-sentence")).toBe("sessionVolumeWords");
    expect(volumeLabelKeyForMethod("partial-dictation")).toBe("sessionVolumeSentences");
    expect(volumeLabelKeyForMethod("srs-session")).toBe("sessionVolumeCards");
  });
});
