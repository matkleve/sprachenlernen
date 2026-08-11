/**
 * Browser smoke for T-B3 /progress — run with: node scripts/smoke-progress-browser.mjs
 * Requires dev server on :3000 and Supabase env vars.
 */
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !publishableKey || !serviceRoleKey) {
  console.error("Missing Supabase env vars.");
  process.exit(1);
}

const password = "correct horse battery staple";
const email = `smoke-progress-${randomUUID()}@example.com`;
const installationId = randomUUID();

const deck = JSON.parse(
  readFileSync(new URL("../data/starter/es-meaning-recall.json", import.meta.url), "utf8"),
);

const admin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: created, error: createError } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (createError || !created.user) {
  console.error("createUser failed:", createError);
  process.exit(1);
}

const userId = created.user.id;
const now = Date.now();
const DAY = 86_400_000;
const cards = deck.cards.slice(0, 15);

const rows = cards.flatMap((card, cardIndex) =>
  ["easy", "easy", "easy"].map((grade, reviewIndex) => ({
    user_id: userId,
    installation_id: installationId,
    task_id: card.taskId,
    grade,
    reviewed_at: new Date(now - (cards.length - cardIndex) * DAY - reviewIndex * 3 * DAY).toISOString(),
    latency_ms: 1200,
    review_id: randomUUID(),
  })),
);

const { error: insertError } = await admin.from("review_log").insert(rows);
if (insertError) {
  console.error("insert reviews failed:", insertError);
  await admin.auth.admin.deleteUser(userId);
  process.exit(1);
}

const artifactsDir = "/opt/cursor/artifacts/screenshots";
mkdirSync(artifactsDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

const checks = { passed: [], failed: [] };
function check(name, ok, detail = "") {
  (ok ? checks.passed : checks.failed).push({ name, detail });
}

try {
  await page.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 15000 });

  await page.goto(`${baseUrl}/progress`, { waitUntil: "networkidle" });
  await page.waitForSelector("h1", { timeout: 10000 });

  const body = await page.locator("body").innerText();

  check("landed on progress", page.url().includes("/progress"));
  check("title visible", /where you stand/i.test(body));
  check(
    "vocabulary pool-local copy",
    /of 50 lemmas held stably in your starter pool/i.test(body) &&
      /not extrapolated to the language/i.test(body),
  );
  check("four skills not measured", (body.match(/not measured/gi) ?? []).length >= 4);
  check("no overall level invented", /no overall level/i.test(body));
  check("gap section present", /language-wide vocabulary estimate/i.test(body));

  const signalsRegion = page.getByRole("region", { name: /seven layer-1 signals/i });
  const signalsText = (await signalsRegion.count()) > 0 ? await signalsRegion.innerText() : "";
  check("signals table has recall stability", /recall stability/i.test(signalsText || body));
  check("signals table has vocabulary size", /estimated vocabulary size/i.test(signalsText || body));
  check("no CEFR in signals table", !/\b[ABC][12](\.\d)?\b/.test(signalsText));

  const screenshotPath = `${artifactsDir}/progress-vocabulary-smoke.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  writeFileSync(
    `${artifactsDir}/progress-vocabulary-smoke-report.json`,
    JSON.stringify({ email, checks, screenshotPath, url: page.url() }, null, 2),
  );

  console.log(JSON.stringify({ screenshotPath, checks }, null, 2));
  if (checks.failed.length > 0) process.exit(1);
} catch (error) {
  const failPath = `${artifactsDir}/progress-vocabulary-smoke-fail.png`;
  await page.screenshot({ path: failPath, fullPage: true }).catch(() => {});
  console.error(error);
  process.exit(1);
} finally {
  await browser.close();
  await admin.auth.admin.deleteUser(userId);
}
