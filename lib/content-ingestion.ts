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
};

export const validateCatalogueLicence = (source: SourceIngestInput): string | null => {
  if (source.origin !== "catalogue") return null;
  const kind = source.licence?.kind;
  if (!kind || !CATALOGUE_LICENCE_KINDS.includes(kind as CatalogueLicenceKind)) {
    return "catalogue sources require licence.kind from the allowlist";
  }
  if (!source.licence?.fetchedAt) {
    return "catalogue sources require licence.fetchedAt";
  }
  return null;
};

export const isLearnerPrivateSource = (source: SourceIngestInput): boolean =>
  source.origin === "learner" && source.licence?.kind === LEARNER_LICENCE_KIND;
