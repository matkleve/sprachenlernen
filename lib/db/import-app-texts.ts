import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Seed `app_texts` + published DE translations from snapshot JSON.
 * Contract: docs/specs/service/app-texts.md (T-B11c)
 *
 * Operator entry:
 *   RUN_APP_TEXTS_IMPORT=1 npx vitest run lib/db/import-app-texts.run.test.ts
 */

export type DescriptionSnapshot = Readonly<Record<string, string>>;

export type ImportAppTextsResult = {
  textsUpserted: number;
  translationsUpserted: number;
};

const CHUNK = 100;

export async function importAppTextsFromSnapshots(
  admin: SupabaseClient,
  en: DescriptionSnapshot,
  de: DescriptionSnapshot,
): Promise<ImportAppTextsResult> {
  const keys = Object.keys(en);
  let textsUpserted = 0;
  let translationsUpserted = 0;

  for (let offset = 0; offset < keys.length; offset += CHUNK) {
    const chunkKeys = keys.slice(offset, offset + CHUNK);
    const textRows = chunkKeys.map((textKey) => ({
      text_key: textKey,
      source_text: en[textKey]!,
      source_lang: "en",
    }));

    const { error: textError } = await admin
      .from("app_texts")
      .upsert(textRows, { onConflict: "text_key" });
    if (textError) throw textError;
    textsUpserted += textRows.length;

    const { data: persisted, error: selectError } = await admin
      .from("app_texts")
      .select("id, text_key")
      .in("text_key", chunkKeys);
    if (selectError) throw selectError;

    const translationRows = (persisted ?? [])
      .map((row) => {
        const textKey = row.text_key as string;
        const translated = de[textKey];
        if (!translated) return null;
        return {
          app_text_id: row.id as string,
          lang: "de",
          translated_text: translated,
          status: "published" as const,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);

    if (translationRows.length === 0) continue;

    const { error: translationError } = await admin
      .from("app_text_translations")
      .upsert(translationRows, { onConflict: "app_text_id,lang" });
    if (translationError) throw translationError;
    translationsUpserted += translationRows.length;
  }

  return { textsUpserted, translationsUpserted };
}
