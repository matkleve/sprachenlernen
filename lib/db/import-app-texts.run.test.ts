import { readFileSync } from "node:fs";
import { join } from "node:path";

import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { importAppTextsFromSnapshots } from "@/lib/db/import-app-texts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hasLiveProject = Boolean(url && serviceRoleKey);
const shouldRun = process.env.RUN_APP_TEXTS_IMPORT === "1";

const ROOT = join(process.cwd(), "data/i18n/descriptions");

/** Operator entry: `npm run import:app-texts` */
describe.skipIf(!hasLiveProject || !shouldRun)("import-app-texts (live)", () => {
  it("imports published EN source + DE translations from snapshot JSON", async () => {
    const en = JSON.parse(readFileSync(join(ROOT, "en.json"), "utf8")) as Record<string, string>;
    const de = JSON.parse(readFileSync(join(ROOT, "de.json"), "utf8")) as Record<string, string>;

    const admin = createClient(url!, serviceRoleKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const result = await importAppTextsFromSnapshots(admin, en, de);
    expect(result.textsUpserted).toBeGreaterThan(0);
    expect(result.translationsUpserted).toBeGreaterThan(0);
  }, 300_000);
});
