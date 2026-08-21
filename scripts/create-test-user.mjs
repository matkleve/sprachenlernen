#!/usr/bin/env node
/**
 * Operator script: recreate the local test account.
 *
 *   SUPABASE_TEST_USER_PASSWORD='…' node scripts/create-test-user.mjs
 *
 * Was `create-test-user.ts` in the repository root, where it sat outside every
 * boundary that applies to the elevated key: `.env.example` says the service
 * role key belongs in `lib/db/` only, and `AGENTS.md § Where things live` has
 * no room for a loose runtime file at the root. It also carried a working
 * password as a literal, and deletes a user before creating one — which is
 * fine for a scratch project and very much not fine pointed at production.
 *
 * So: it lives in `scripts/` with the other operator entry points, takes the
 * password from the environment, and refuses to run against anything that
 * looks like production.
 */

import { createClient } from "@supabase/supabase-js";

const EMAIL = process.env.SUPABASE_TEST_USER_EMAIL ?? "test@example.com";
const password = process.env.SUPABASE_TEST_USER_PASSWORD;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function fail(message) {
  console.error(`✗ ${message}`);
  process.exit(1);
}

if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
  fail("refusing to run with a production environment — this script deletes a user.");
}
if (!url || !serviceRoleKey) {
  fail("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set — see .env.example");
}
if (!password) {
  fail(
    "SUPABASE_TEST_USER_PASSWORD must be set.\n" +
      "  A password in the source is a password in every clone and every diff.",
  );
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: existing, error: listError } = await supabase.auth.admin.listUsers();
if (listError) fail(`could not list users: ${listError.message}`);

const previous = existing?.users.find((candidate) => candidate.email === EMAIL);
if (previous) {
  const { error } = await supabase.auth.admin.deleteUser(previous.id);
  if (error) fail(`could not delete the existing ${EMAIL}: ${error.message}`);
  console.log(`· deleted existing ${EMAIL}`);
}

const { data, error } = await supabase.auth.admin.createUser({
  email: EMAIL,
  password,
  email_confirm: true,
  user_metadata: {},
});
if (error) fail(`could not create ${EMAIL}: ${error.message}`);

console.log(`✓ created ${data.user.email} (${data.user.id})`);
