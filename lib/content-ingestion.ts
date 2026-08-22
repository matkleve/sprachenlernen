/**
 * Catalogue ingestion rules. Contract: docs/specs/service/content-ingestion.md
 */

export const CATALOGUE_LICENCE_KINDS = [
  "cc-by",
  "cc-by-sa",
  "cc0",
  "public-domain",
  "partner-tos",
  "generated",
] as const;

export const LEARNER_LICENCE_KIND = "learner-private" as const;

export type CatalogueLicenceKind = (typeof CATALOGUE_LICENCE_KINDS)[number];
export type SourceLicenceKind = CatalogueLicenceKind | typeof LEARNER_LICENCE_KIND;

export type SourceLicence = {
  kind: SourceLicenceKind;
  attribution?: string;
  sourceUrl?: string;
  partnerId?: string;
  fetchedAt: string;
};

export type SourceIngestInput = {
  origin: "catalogue" | "fixture" | "learner";
  licence?: SourceLicence;
  generated?: boolean;
};

export function learnerPrivateLicence(fetchedAt: string = new Date().toISOString()): SourceLicence {
  return { kind: LEARNER_LICENCE_KIND, fetchedAt };
}

export function generatedLicence(fetchedAt: string = new Date().toISOString()): SourceLicence {
  return { kind: "generated", fetchedAt };
}

export const validateCatalogueLicence = (source: SourceIngestInput): string | null => {
  if (source.origin !== "catalogue") return null;
  const kind = source.licence?.kind;
  if (!kind || !CATALOGUE_LICENCE_KINDS.includes(kind as CatalogueLicenceKind)) {
    return "catalogue sources require licence.kind from the allowlist";
  }
  if (!source.licence?.fetchedAt) {
    return "catalogue sources require licence.fetchedAt";
  }
  if (source.generated === true && kind !== "generated") {
    return "generated catalogue sources require licence.kind generated";
  }
  if (kind === "generated" && source.generated !== true) {
    return "licence.kind generated requires generated: true";
  }
  return null;
};

export const isLearnerPrivateSource = (source: SourceIngestInput): boolean =>
  source.origin === "learner" && source.licence?.kind === LEARNER_LICENCE_KIND;

/** Catalogue rows must carry licence metadata — docs/specs/service/content-ingestion.md */
export const validateSourceIngestion = (
  source: SourceIngestInput,
  prefix = "source",
): string | null => {
  if (source.origin === "catalogue") {
    const error = validateCatalogueLicence(source);
    return error ? `${prefix}: ${error}` : null;
  }
  return null;
};
