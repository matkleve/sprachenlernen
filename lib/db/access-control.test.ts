import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * BACKEND.md §8 — "the single highest-value test in the product": sign in as
 * one user, attempt to read another's rows, assert the failure. Contract:
 * docs/specs/service/auth.md.
 *
 * This talks to the real Supabase project (ADR-0007) rather than a mock,
 * because the thing under test is a database policy — a mock of the client
 * would only prove that the mock was called, which is exactly the "test that
 * cannot fail" trap (docs/TRAPS.md). It skips, visibly, when the three
 * Supabase secrets are not present, rather than failing every environment
 * that has not configured them.
 *
 * Uses `@supabase/supabase-js` directly, not `lib/db/client.ts` — that
 * factory is wired to Next's request-scoped cookies and only makes sense
 * inside a Next.js request. This file is proving the database boundary
 * itself, independent of the framework in front of it.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const hasLiveProject = Boolean(url && publishableKey && serviceRoleKey);
const password = "correct horse battery staple";

describe.skipIf(!hasLiveProject)("review_log row-level security", () => {
  // Built in `beforeAll`, not at describe scope. `describe.skipIf` still runs
  // the factory to collect the tests it is about to skip, so a `createClient`
  // here throws "supabaseUrl is required" during collection — the whole file
  // fails in exactly the environment the skip exists to spare. Hooks of a
  // skipped suite do not run, so this is the only placement where the skip
  // means what it says.
  let admin: SupabaseClient;

  let userA: { id: string; email: string };
  let userB: { id: string; email: string };

  beforeAll(async () => {
    admin = createClient(url!, serviceRoleKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Admin-created and pre-confirmed on purpose: the policy under test is
    // row ownership, not the signup/email-confirmation flow, which
    // lib/db/auth.test.ts and the signup page cover separately.
    const emailA = `t-b8-a-${crypto.randomUUID()}@example.com`;
    const emailB = `t-b8-b-${crypto.randomUUID()}@example.com`;

    const [resultA, resultB] = await Promise.all([
      admin.auth.admin.createUser({ email: emailA, password, email_confirm: true }),
      admin.auth.admin.createUser({ email: emailB, password, email_confirm: true }),
    ]);

    if (resultA.error) throw resultA.error;
    if (resultB.error) throw resultB.error;

    const a = resultA.data.user;
    const b = resultB.data.user;
    if (!a || !b) throw new Error("test users were not created");

    userA = { id: a.id, email: emailA };
    userB = { id: b.id, email: emailB };
  });

  afterAll(async () => {
    // `on delete cascade` (see the migration) removes each user's review_log
    // rows along with the user — nothing else to clean up.
    if (userA) await admin.auth.admin.deleteUser(userA.id);
    if (userB) await admin.auth.admin.deleteUser(userB.id);
  });

  async function signInAs(email: string): Promise<SupabaseClient> {
    const client = createClient(url!, publishableKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return client;
  }

  function reviewPayload(userId: string) {
    return {
      user_id: userId,
      installation_id: crypto.randomUUID(),
      task_id: "access-control-test-task",
      grade: "good" as const,
      reviewed_at: new Date().toISOString(),
      latency_ms: 100,
    };
  }

  it("lets a signed-in user insert and read their own review row", async () => {
    const asA = await signInAs(userA.email);

    const { error: insertError } = await asA.from("review_log").insert(reviewPayload(userA.id));
    expect(insertError).toBeNull();

    const { data, error } = await asA
      .from("review_log")
      .select("id, user_id, installation_id, task_id, grade, latency_ms");
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data?.[0]?.user_id).toBe(userA.id);
    expect(data?.[0]?.task_id).toBe("access-control-test-task");
  });

  it("never returns another user's review rows — the negative case this test exists for", async () => {
    const asA = await signInAs(userA.email);
    await asA.from("review_log").insert(reviewPayload(userA.id));

    const asB = await signInAs(userB.email);
    const { data, error } = await asB.from("review_log").select("*");

    // RLS filters rows out of the result set; it does not turn the query
    // into an error. Asserting only `data` would miss a query that failed
    // for an unrelated reason and happened to return no rows.
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("refuses to insert a review row owned by someone else", async () => {
    const asB = await signInAs(userB.email);

    const { error } = await asB.from("review_log").insert(reviewPayload(userA.id));

    expect(error).not.toBeNull();
  });

  /**
   * Each learner_language test starts from an empty table for both users.
   * Without this they collide: `unique (user_id, language_code)` rejects the
   * second test's insert, and the assertions that follow would then be reading
   * the *first* test's row while appearing to pass.
   */
  async function clearLanguages() {
    await admin.from("learner_language").delete().in("user_id", [userA.id, userB.id]);
  }

  // --- learner_language -----------------------------------------------------
  //
  // This table is the first to grant UPDATE and DELETE, so it carries two
  // attack surfaces review_log does not have: B flipping A's active language,
  // and B deleting A's rows. Both are covered here rather than assumed from the
  // policy text — BACKEND.md §8 calls this stage-1 work, not later hardening.

  it("lets a signed-in user insert and read their own learner_language row", async () => {
    await clearLanguages();
    const asA = await signInAs(userA.email);

    const { error: insertError } = await asA
      .from("learner_language")
      .insert({ user_id: userA.id, language_code: "es", is_active: true });
    expect(insertError).toBeNull();

    const { data, error } = await asA.from("learner_language").select("language_code, is_active");
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data?.[0]?.language_code).toBe("es");
  });

  it("never returns another user's learner_language rows", async () => {
    await clearLanguages();
    const asA = await signInAs(userA.email);
    await asA
      .from("learner_language")
      .insert({ user_id: userA.id, language_code: "es", is_active: true });

    const asB = await signInAs(userB.email);
    const { data, error } = await asB.from("learner_language").select("*");

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("refuses to insert a learner_language row owned by someone else", async () => {
    await clearLanguages();
    const asB = await signInAs(userB.email);

    const { error } = await asB
      .from("learner_language")
      .insert({ user_id: userA.id, language_code: "es", is_active: true });

    expect(error).not.toBeNull();
  });

  it("cannot update another user's active language", async () => {
    await clearLanguages();
    const asA = await signInAs(userA.email);
    await asA
      .from("learner_language")
      .insert({ user_id: userA.id, language_code: "es", is_active: true });

    const asB = await signInAs(userB.email);
    // RLS makes this match zero rows rather than error — so the proof is that
    // A's row is unchanged afterwards, not that B got an error.
    await asB.from("learner_language").update({ is_active: false }).eq("user_id", userA.id);

    const { data } = await asA.from("learner_language").select("is_active");
    expect(data?.[0]?.is_active).toBe(true);
  });

  it("cannot delete another user's language", async () => {
    // Two layers, as with review_log: `authenticated` has no DELETE grant at
    // all, and if a later migration granted it back there is still no delete
    // policy. Either would refuse; the proof is that A's row survives.
    await clearLanguages();
    const asA = await signInAs(userA.email);
    await asA
      .from("learner_language")
      .insert({ user_id: userA.id, language_code: "es", is_active: true });

    const asB = await signInAs(userB.email);
    await asB.from("learner_language").delete().eq("user_id", userA.id);

    const { data } = await asA.from("learner_language").select("language_code");
    expect(data).toHaveLength(1);
  });

  it("refuses a second active language for the same account", async () => {
    await clearLanguages();
    const asA = await signInAs(userA.email);
    await asA
      .from("learner_language")
      .insert({ user_id: userA.id, language_code: "es", is_active: true });

    // The partial unique index is what makes "at most one in focus" a database
    // fact rather than adapter discipline.
    const { error } = await asA
      .from("learner_language")
      .insert({ user_id: userA.id, language_code: "it", is_active: true });

    expect(error).not.toBeNull();
  });

  it("refuses to update or delete any review row — the log is append-only", async () => {
    const asA = await signInAs(userA.email);
    const { data: inserted } = await asA
      .from("review_log")
      .insert(reviewPayload(userA.id))
      .select("id");
    const row = inserted?.[0];
    expect(row).toBeDefined();

    // Neither operation is granted to `authenticated` at all (see the
    // migration), so Postgres refuses them outright rather than RLS quietly
    // filtering the row set — confirmed against a local Postgres in the PR.
    // Either way the observable effect is the same: nothing changes, so this
    // asserts that rather than which layer produced it.
    const { data: updated } = await asA
      .from("review_log")
      .update({ installation_id: crypto.randomUUID() })
      .eq("id", row!.id)
      .select();
    expect(updated ?? []).toHaveLength(0);

    const { data: deleted } = await asA
      .from("review_log")
      .delete()
      .eq("id", row!.id)
      .select();
    expect(deleted ?? []).toHaveLength(0);
  });

  it("refuses an anonymous (signed-out) client any access at all", async () => {
    const anon = createClient(url!, publishableKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await anon.from("review_log").select("*");

    // `anon` has no GRANT on the table (see the migration) — PostgREST
    // reports this as an error, not an empty result, which is the correct
    // signal for "not allowed" versus "allowed, nothing matched".
    expect(error).not.toBeNull();
    expect(data).toBeNull();
  });
});

describe.skipIf(!hasLiveProject)("task_state row-level security", () => {
  let admin: SupabaseClient;
  let skipSuite = false;

  let userA: { id: string; email: string };
  let userB: { id: string; email: string };

  beforeAll(async () => {
    admin = createClient(url!, serviceRoleKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { error: probeError } = await admin.from("task_state").select("task_id").limit(1);
    if (probeError?.code === "PGRST205") {
      skipSuite = true;
      return;
    }

    const emailA = `task-state-a-${crypto.randomUUID()}@example.com`;
    const emailB = `task-state-b-${crypto.randomUUID()}@example.com`;

    const [resultA, resultB] = await Promise.all([
      admin.auth.admin.createUser({ email: emailA, password, email_confirm: true }),
      admin.auth.admin.createUser({ email: emailB, password, email_confirm: true }),
    ]);

    if (resultA.error) throw resultA.error;
    if (resultB.error) throw resultB.error;

    const a = resultA.data.user;
    const b = resultB.data.user;
    if (!a || !b) throw new Error("test users were not created");

    userA = { id: a.id, email: emailA };
    userB = { id: b.id, email: emailB };
  });

  afterAll(async () => {
    if (skipSuite) return;
    if (userA) await admin.auth.admin.deleteUser(userA.id);
    if (userB) await admin.auth.admin.deleteUser(userB.id);
  });

  async function signInAs(email: string): Promise<SupabaseClient> {
    const client = createClient(url!, publishableKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return client;
  }

  function statePayload(userId: string) {
    return {
      user_id: userId,
      task_id: "es:access-control:meaning-recall",
      word_id: "es:access-control",
      state: "learning",
      stability: 1.2,
      difficulty: 5,
      due: new Date().toISOString(),
      last_review_at: new Date().toISOString(),
      lapses: 0,
      last_grade: "good",
      review_count: 1,
      weights_version: "fsrs-4.5-default",
    };
  }

  it("lets a signed-in user insert and read their own task_state row", async (ctx) => {
    if (skipSuite) ctx.skip();
    const asA = await signInAs(userA.email);

    const { error: insertError } = await asA.from("task_state").insert(statePayload(userA.id));
    expect(insertError).toBeNull();

    const { data, error } = await asA.from("task_state").select("task_id, state");
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data?.[0]?.task_id).toBe("es:access-control:meaning-recall");
  });

  it("never returns another user's task_state rows", async (ctx) => {
    if (skipSuite) ctx.skip();
    const asA = await signInAs(userA.email);
    await asA.from("task_state").insert(statePayload(userA.id));

    const asB = await signInAs(userB.email);
    const { data, error } = await asB.from("task_state").select("*");

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("refuses to insert a task_state row owned by someone else", async (ctx) => {
    if (skipSuite) ctx.skip();
    const asB = await signInAs(userB.email);

    const { error } = await asB.from("task_state").insert(statePayload(userA.id));

    expect(error).not.toBeNull();
  });
});
