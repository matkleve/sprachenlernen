/**
 * Partner lane-B ingest (DW, BBC Learning English). Contract:
 * docs/specs/service/content-ingestion.md (T-CI8)
 */
import type { Source } from "@/lib/coverage";
import type { SourceLicence } from "@/lib/content-ingestion";

export type PartnerId = "dw" | "bbc-learning-english";

export type PartnerFeedConfig = {
  partnerId: PartnerId;
  displayName: string;
  attribution: string;
  tosUrl: string;
  lastReviewedAt: string;
};

export const PARTNER_FEED_REGISTRY: Record<PartnerId, PartnerFeedConfig> = {
  dw: {
    partnerId: "dw",
    displayName: "Deutsche Welle",
    attribution: "Deutsche Welle",
    tosUrl: "https://www.dw.com/en/european-data-protection-directive/a-18297744",
    lastReviewedAt: "2026-08-22",
  },
  "bbc-learning-english": {
    partnerId: "bbc-learning-english",
    displayName: "BBC Learning English",
    attribution: "BBC Learning English",
    tosUrl: "https://www.bbc.co.uk/learningenglish/",
    lastReviewedAt: "2026-08-22",
  },
};

export type PartnerFeedInput = {
  partnerId: PartnerId;
  languageCode: string;
  slug: string;
  kind: "text" | "audio";
  title: string;
  body?: string;
  transcript?: string;
  tags?: string[];
  world?: Source["world"];
  series?: string;
  episodeLabel?: string;
  sourceUrl: string;
};

export const isRegisteredPartnerId = (partnerId: string): partnerId is PartnerId =>
  partnerId in PARTNER_FEED_REGISTRY;

export function partnerSourceId(partnerId: PartnerId, languageCode: string, slug: string): string {
  return `partner-${partnerId}-${languageCode}-${slug}`;
}

export function partnerLicence(
  partnerId: PartnerId,
  sourceUrl: string,
  fetchedAt: string,
): SourceLicence {
  const config = PARTNER_FEED_REGISTRY[partnerId];
  return {
    kind: "partner-tos",
    partnerId: config.partnerId,
    attribution: config.attribution,
    sourceUrl,
    fetchedAt,
  };
}

export const validatePartnerLicence = (licence: SourceLicence): string | null => {
  if (licence.kind !== "partner-tos") return null;
  if (!licence.partnerId?.trim()) return "partner-tos requires licence.partnerId";
  if (!isRegisteredPartnerId(licence.partnerId)) {
    return "partner-tos partnerId is not on the ingest allowlist";
  }
  if (!licence.attribution?.trim()) return "partner-tos requires licence.attribution";
  if (!licence.sourceUrl?.trim()) return "partner-tos requires licence.sourceUrl";
  if (!licence.fetchedAt) return "partner-tos requires licence.fetchedAt";
  return null;
};

export const isPartnerCatalogueSource = (source: Source): boolean =>
  source.origin === "catalogue" && source.licence?.kind === "partner-tos";

export const attributionForSource = (
  source: Source,
): { text: string; url?: string } | null => {
  const attribution = source.licence?.attribution?.trim();
  if (!attribution) return null;
  const url = source.sourceUrl ?? source.licence?.sourceUrl ?? undefined;
  return { text: attribution, url };
};

export function normalizePartnerFeedToSource(
  input: PartnerFeedInput,
  fetchedAt: string = new Date().toISOString(),
): Source | null {
  const config = PARTNER_FEED_REGISTRY[input.partnerId];
  const text =
    input.kind === "text" ? input.body?.trim() : input.transcript?.trim();
  if (!text) return null;

  const licence = partnerLicence(input.partnerId, input.sourceUrl, fetchedAt);

  return {
    id: partnerSourceId(input.partnerId, input.languageCode, input.slug),
    languageCode: input.languageCode,
    kind: input.kind,
    title: input.title,
    origin: "catalogue",
    body: input.kind === "text" ? text : undefined,
    transcript: input.kind === "audio" ? text : undefined,
    tags: input.tags,
    world: input.world,
    series: input.series,
    episodeLabel: input.episodeLabel,
    sourceUrl: input.sourceUrl,
    addedAt: fetchedAt,
    licence,
  };
}
