/**
 * One-shot smoke: seed a throwaway user with review history, print login for
 * browser verification. Deletes the user on exit.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !publishableKey || !serviceRoleKey) {
  console.error("Missing Supabase env vars — cannot run live smoke.");
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

// Fifteen cards, three easy grades each — enough to graduate several to "held".
const cards = deck.cards.slice(0, 15);
const rows = cards.flatMap((card, cardIndex) =>
  (["easy", "easy", "easy"]).map((grade, reviewIndex) => ({
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

console.log(JSON.stringify({ email, password, userId, reviewRows: rows.length }, null, 2));
console.error("User left in place for browser smoke — delete manually or re-run cleanup.");
