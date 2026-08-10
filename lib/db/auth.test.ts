import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import { deleteAccount, getAccount, signIn, signOut, signUp } from "@/lib/db/auth";

/**
 * Unit coverage for the outcome mapping in lib/db/auth.ts — offline, no
 * network. The real database boundary (RLS, ownership) is proven separately
 * in lib/db/access-control.test.ts against the live Supabase project, per
 * BACKEND.md §8: that is the test this spec's "Check" line names.
 */

vi.mock("@/lib/db/admin-client", () => ({
  createServiceRoleSupabaseClient: vi.fn(),
}));

import { createServiceRoleSupabaseClient } from "@/lib/db/admin-client";

function fakeClient(overrides: {
  signUp?: unknown;
  signInWithPassword?: unknown;
  signOut?: unknown;
  getUser?: unknown;
}): SupabaseClient {
  return {
    auth: {
      signUp: vi.fn().mockResolvedValue(overrides.signUp),
      signInWithPassword: vi.fn().mockResolvedValue(overrides.signInWithPassword),
      signOut: vi.fn().mockResolvedValue(overrides.signOut),
      getUser: vi.fn().mockResolvedValue(overrides.getUser),
    },
  } as unknown as SupabaseClient;
}

const user = { id: "user-1", email: "a@example.com" };

describe("signUp", () => {
  it("is signed-in when Supabase returns a session immediately", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://sprachenlernen.vercel.app";
    const signUpFn = vi.fn().mockResolvedValue({
      data: { user, session: { access_token: "t" } },
      error: null,
    });
    const client = fakeClient({ signUp: undefined });
    (client.auth.signUp as ReturnType<typeof vi.fn>) = signUpFn;

    const result = await signUp("a@example.com", "correct horse battery staple", client);

    expect(signUpFn).toHaveBeenCalledWith({
      email: "a@example.com",
      password: "correct horse battery staple",
      options: { emailRedirectTo: "https://sprachenlernen.vercel.app/auth/callback" },
    });
    expect(result).toEqual({
      status: "signed-in",
      account: { id: "user-1", email: "a@example.com" },
    });
  });

  it("requires confirmation when Supabase returns a user with no session", async () => {
    const client = fakeClient({
      signUp: { data: { user, session: null }, error: null },
    });

    const result = await signUp("a@example.com", "correct horse battery staple", client);

    expect(result.status).toBe("confirmation-required");
  });

  it("surfaces the error Supabase reports, rather than swallowing it", async () => {
    const client = fakeClient({
      signUp: { data: { user: null, session: null }, error: { message: "Password too short" } },
    });

    const result = await signUp("a@example.com", "x", client);

    expect(result).toEqual({ status: "error", error: "Password too short" });
  });
});

describe("signIn", () => {
  it("is signed-in on valid credentials — the legal path must not be refused", async () => {
    const client = fakeClient({
      signInWithPassword: { data: { user, session: { access_token: "t" } }, error: null },
    });

    const result = await signIn("a@example.com", "correct horse battery staple", client);

    expect(result).toEqual({
      status: "signed-in",
      account: { id: "user-1", email: "a@example.com" },
    });
  });

  it("reports an error on invalid credentials, without inventing its own message", async () => {
    const client = fakeClient({
      signInWithPassword: {
        data: { user: null, session: null },
        error: { message: "Invalid login credentials" },
      },
    });

    const result = await signIn("a@example.com", "wrong", client);

    expect(result).toEqual({ status: "error", error: "Invalid login credentials" });
  });
});

describe("signOut", () => {
  it("reports signed-out on success", async () => {
    const client = fakeClient({ signOut: { error: null } });
    expect(await signOut(client)).toEqual({ status: "signed-out" });
  });

  it("reports the error on failure", async () => {
    const client = fakeClient({ signOut: { error: { message: "network error" } } });
    expect(await signOut(client)).toEqual({ status: "error", error: "network error" });
  });
});

describe("getAccount", () => {
  it("returns the Account when a user is signed in", async () => {
    const client = fakeClient({ getUser: { data: { user } } });
    expect(await getAccount(client)).toEqual({ id: "user-1", email: "a@example.com" });
  });

  it("returns null when signed out, rather than throwing", async () => {
    const client = fakeClient({ getUser: { data: { user: null } } });
    expect(await getAccount(client)).toBeNull();
  });
});

describe("deleteAccount", () => {
  it("deletes the signed-in user and signs out", async () => {
    const deleteUser = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createServiceRoleSupabaseClient).mockReturnValue({
      auth: { admin: { deleteUser } },
    } as unknown as ReturnType<typeof createServiceRoleSupabaseClient>);

    const signOutFn = vi.fn().mockResolvedValue({ error: null });
    const client = fakeClient({
      getUser: { data: { user } },
      signOut: { error: null },
    });
    (client.auth.signOut as ReturnType<typeof vi.fn>) = signOutFn;

    expect(await deleteAccount(client)).toEqual({ status: "deleted" });
    expect(deleteUser).toHaveBeenCalledWith("user-1");
    expect(signOutFn).toHaveBeenCalled();
  });

  it("errors when signed out", async () => {
    const client = fakeClient({ getUser: { data: { user: null } } });
    expect(await deleteAccount(client)).toEqual({
      status: "error",
      error: "You must be signed in to delete your account.",
    });
  });
});
