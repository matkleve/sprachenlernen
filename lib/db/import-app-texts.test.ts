import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import { importAppTextsFromSnapshots } from "@/lib/db/import-app-texts";

function importClient(options: {
  textIds?: Record<string, string>;
}) {
  const textIds = options.textIds ?? {
    "card.it:fare.meaning-recall.back": "text-id-fare",
  };

  const upsertTexts = vi.fn().mockResolvedValue({ error: null });
  const upsertTranslations = vi.fn().mockResolvedValue({ error: null });

  const from = vi.fn().mockImplementation((table: string) => {
    if (table === "app_texts") {
      return {
        upsert: upsertTexts,
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockImplementation((_column: string, keys: string[]) =>
            Promise.resolve({
              data: keys.map((textKey) => ({ id: textIds[textKey], text_key: textKey })),
              error: null,
            }),
          ),
        }),
      };
    }
    if (table === "app_text_translations") {
      return { upsert: upsertTranslations };
    }
    throw new Error(`unexpected table ${table}`);
  });

  return {
    client: { from } as unknown as SupabaseClient,
    upsertTexts,
    upsertTranslations,
  };
}

describe("importAppTextsFromSnapshots", () => {
  it("AC-5: upserts fare source text and published German translation", async () => {
    const { client, upsertTexts, upsertTranslations } = importClient({});

    const result = await importAppTextsFromSnapshots(
      client,
      { "card.it:fare.meaning-recall.back": "to do" },
      { "card.it:fare.meaning-recall.back": "tun" },
    );

    expect(result).toEqual({ textsUpserted: 1, translationsUpserted: 1 });
    expect(upsertTexts).toHaveBeenCalledWith(
      [
        {
          text_key: "card.it:fare.meaning-recall.back",
          source_text: "to do",
          source_lang: "en",
        },
      ],
      { onConflict: "text_key" },
    );
    expect(upsertTranslations).toHaveBeenCalledWith(
      [
        {
          app_text_id: "text-id-fare",
          lang: "de",
          translated_text: "tun",
          status: "published",
        },
      ],
      { onConflict: "app_text_id,lang" },
    );
  });

  it("skips German rows when the locale snapshot omits a key", async () => {
    const { client, upsertTranslations } = importClient({});

    await importAppTextsFromSnapshots(
      client,
      { "card.es:nuevo.meaning-recall.back": "new" },
      {},
    );

    expect(upsertTranslations).not.toHaveBeenCalled();
  });
});
