import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { loadSources } from "@/lib/coverage";
import {
  attributionForSource,
  normalizePartnerFeedToSource,
  partnerSourceId,
  validatePartnerLicence,
} from "@/lib/partner-feed-ingest";

describe("partner-feed-ingest", () => {
  it("builds a partner-tos catalogue source with stable id", () => {
    const source = normalizePartnerFeedToSource({
      partnerId: "dw",
      languageCode: "es",
      slug: "lgsn-2026-08",
      kind: "text",
      title: "Noticias lentas de Alemania",
      body: "Uno dos tres. En Alemania hay elecciones.",
      tags: ["news"],
      sourceUrl: "https://www.dw.com/es/noticias-lentas/ejemplo",
    }, "2026-08-22T12:00:00.000Z");

    expect(source?.id).toBe(partnerSourceId("dw", "es", "lgsn-2026-08"));
    expect(source?.licence?.kind).toBe("partner-tos");
    expect(source?.licence?.partnerId).toBe("dw");
    expect(source?.licence?.attribution).toBe("Deutsche Welle");
  });

  it("validates partner licence metadata", () => {
    expect(
      validatePartnerLicence({
        kind: "partner-tos",
        partnerId: "dw",
        attribution: "Deutsche Welle",
        sourceUrl: "https://www.dw.com/es/ejemplo",
        fetchedAt: "2026-08-22T12:00:00.000Z",
      }),
    ).toBeNull();

    expect(
      validatePartnerLicence({
        kind: "partner-tos",
        attribution: "Deutsche Welle",
        sourceUrl: "https://www.dw.com/es/ejemplo",
        fetchedAt: "2026-08-22T12:00:00.000Z",
      }),
    ).toMatch(/partnerId/);
  });

  it("loads shipped partner fixture from data/content/es.json", () => {
    const { sources, errors } = loadSources(
      JSON.parse(readFileSync(join(process.cwd(), "data/content/es.json"), "utf8")),
    );
    expect(errors).toEqual([]);
    const partner = sources.find((source) => source.id.startsWith("partner-dw-"));
    expect(partner).toBeDefined();
    expect(partner?.licence?.kind).toBe("partner-tos");
    expect(attributionForSource(partner!)?.text).toBe("Deutsche Welle");
  });
});
