/** Catalogue language ids for `data/content/{code}.json` — no Node I/O. */
export const CONTENT_SOURCE_LANGUAGES = ["es", "it"] as const;

/** Default catalogue source for partial dictation when no `sourceId` is passed. */
export const DEFAULT_PARTIAL_DICTATION_SOURCE_ID = "es-fixture-cafe";

/** Default catalogue source for extensive reading when no `sourceId` is passed. */
export const DEFAULT_EXTENSIVE_READING_SOURCE_ID = "wikinews-es-3516";
