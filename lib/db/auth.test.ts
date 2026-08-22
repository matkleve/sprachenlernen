import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  deleteAccount,
  getAccount,
  resendConfirmation,
  signIn,
  signOut,
  signUp,
} from "@/lib/db/auth";

/**
 * Unit coverage for the outcome mapping in lib/db/auth.ts — offline, no
 * network. The real database boundary (RLS, ownership) is proven separately
 * in lib/db/access-control.test.ts against the live Supabase project, per
 * BACKEND.md §8: that is the test this spec's "Check" line names.
 */

vi.mock("@/lib/db/admin-client", () => ({
  createServiceRoleSupabaseClient: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  createServerSupabaseClient: vi.fn(),
}));

import { createServiceRoleSupabaseClient } from "@/lib/db/admin-client";
import { createServerSupabaseClient } from "@/lib/db/client";

function fakeClient(overrides: {
  signUp?: unknown;
  signInWithPassword?: unknown;
  signOut?: unknown;
  getUser?: unknown;
  getSession?: unknown;
  resend?: unknown;
}): SupabaseClient {
  const sessionFromGetUser =
    overrides.getUser !== undefined
      ? {
          data: {
            session:
              (overrides.getUser as { data?: { user?: typeof user | null } }).data?.user ===
              undefined
                ? null
                : (overrides.getUser as { data: { user: typeof user | null } }).data.user
                  ? { user: (overrides.getUser as { data: { user: typeof user } }).data.user }
                  : null,
          },
        }
      : undefined;

  return {
    auth: {
      signUp: vi.fn().mockResolvedValue(overrides.signUp),
      signInWithPassword: vi.fn().mockResolvedValue(overrides.signInWithPassword),
      signOut: vi.fn().mockResolvedValue(overrides.signOut),
      getUser: vi.fn().mockResolvedValue(overrides.getUser),
      getSession: vi.fn().mockResolvedValue(overrides.getSession ?? sessionFromGetUser),
      resend: vi.fn().mockResolvedValue(overrides.resend),
    },
  } as unknown as SupabaseClient;
}

const user = { id: "user-1", email: "a@example.com" };

const defaultServerClient = {
  auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
};

beforeEach(() => {
  vi.mocked(createServerSupabaseClient).mockReset();
  vi.mocked(createServerSupabaseClient).mockResolvedValue(defaultServerClient as never);
});

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

describe("resendConfirmation", () => {
  it("asks Supabase to resend the signup confirmation to that exact address", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://sprachenlernen.vercel.app";
    const client = fakeClient({ resend: { data: {}, error: null } });

    const result = await resendConfirmation("a@example.com", client);

    expect(client.auth.resend).toHaveBeenCalledWith({
      type: "signup",
      email: "a@example.com",
      options: { emailRedirectTo: "https://sprachenlernen.vercel.app/auth/callback" },
    });
    expect(result).toEqual({ status: "sent" });
  });

  it("surfaces the error Supabase reports, rather than swallowing it", async () => {
    const client = fakeClient({
      resend: { data: null, error: { message: "For security purposes, you can only request this after 39 seconds." } },
    });

    const result = await resendConfirmation("a@example.com", client);

    expect(result).toEqual({
      status: "error",
      error: "For security purposes, you can only request this after 39 seconds.",
    });
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
    const client = fakeClient({
      getSession: { data: { session: { user } } },
    });
    expect(await getAccount(client)).toEqual({ id: "user-1", email: "a@example.com" });
  });

  it("returns null when signed out, rather than throwing", async () => {
    const client = fakeClient({ getSession: { data: { session: null } } });
    expect(await getAccount(client)).toBeNull();
  });

  it("routes the cached server client through the request path", async () => {
    const getSession = vi.fn().mockResolvedValue({ data: { session: { user } } });
    const requestClient = { auth: { getSession } } as unknown as SupabaseClient;
    vi.mocked(createServerSupabaseClient).mockResolvedValue(requestClient as never);

    expect(await getAccount(requestClient)).toEqual({ id: "user-1", email: "a@example.com" });
    expect(getSession).toHaveBeenCalledTimes(1);
  });

  it("reads an injected test client directly", async () => {
    const testClient = fakeClient({ getSession: { data: { session: { user } } } });

    expect(await getAccount(testClient)).toEqual({ id: "user-1", email: "a@example.com" });
    expect(testClient.auth.getSession).toHaveBeenCalledTimes(1);
    expect(defaultServerClient.auth.getSession).not.toHaveBeenCalled();
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
      getSession: { data: { session: { user } } },
      getUser: { data: { user }, error: null },
      signOut: { error: null },
    });
    (client.auth.signOut as ReturnType<typeof vi.fn>) = signOutFn;
    vi.mocked(createServerSupabaseClient).mockResolvedValue(client);

    expect(await deleteAccount(client)).toEqual({ status: "deleted" });
    expect(deleteUser).toHaveBeenCalledWith("user-1");
    expect(signOutFn).toHaveBeenCalled();
  });

  it("errors when signed out", async () => {
    const client = fakeClient({
      getSession: { data: { session: null } },
      getUser: { data: { user: null }, error: null },
    });
    vi.mocked(createServerSupabaseClient).mockResolvedValue(client);
    expect(await deleteAccount(client)).toEqual({
      status: "error",
      error: "You must be signed in to delete your account.",
    });
  });
});

describe("deleteAccount — identity must come from the Auth server", () => {
  /**
   * The reason this suite exists: `getSession()` reads the cookie and checks
   * only shape and `expires_at` — it never verifies the JWT signature (see
   * @supabase/auth-js `__loadSession`, which wraps the user in
   * `insecureUserWarningProxy` on the server for exactly this reason). Every
   * other adapter survives a forged cookie because PostgREST verifies the JWT
   * before RLS runs. Deletion does not: it hands the id to the service-role
   * client, which bypasses RLS entirely. So this one path must confirm the
   * account against Supabase Auth, not against the cookie.
   */
  it("refuses when the Auth server does not confirm the cookie's session", async () => {
    const deleteUser = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createServiceRoleSupabaseClient).mockReturnValue({
      auth: { admin: { deleteUser } },
    } as unknown as ReturnType<typeof createServiceRoleSupabaseClient>);

    // A forged cookie: the session decodes to a victim, the Auth server
    // rejects the token it carries.
    const client = fakeClient({
      getSession: { data: { session: { user: { id: "victim", email: "v@example.com" } } } },
      getUser: { data: { user: null }, error: { message: "invalid JWT" } },
    });
    vi.mocked(createServerSupabaseClient).mockResolvedValue(client);

    expect(await deleteAccount(client)).toEqual({
      status: "error",
      error: "You must be signed in to delete your account.",
    });
    expect(deleteUser).not.toHaveBeenCalled();
  });

  it("deletes the id the Auth server returns, never the id the cookie claims", async () => {
    const deleteUser = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(createServiceRoleSupabaseClient).mockReturnValue({
      auth: { admin: { deleteUser } },
    } as unknown as ReturnType<typeof createServiceRoleSupabaseClient>);

    const client = fakeClient({
      getSession: { data: { session: { user: { id: "victim", email: "v@example.com" } } } },
      getUser: { data: { user }, error: null },
      signOut: { error: null },
    });
    vi.mocked(createServerSupabaseClient).mockResolvedValue(client);

    expect(await deleteAccount(client)).toEqual({ status: "deleted" });
    expect(deleteUser).toHaveBeenCalledWith("user-1");
    expect(deleteUser).not.toHaveBeenCalledWith("victim");
  });
});
