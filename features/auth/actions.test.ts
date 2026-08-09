import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { signIn, signUp } from "@/lib/db/auth";

import { signInAction, signUpAction } from "./actions";

/**
 * Covers acceptance criteria 1–3 in docs/specs/service/auth.md — the redirect
 * each outcome produces. `lib/db/auth.test.ts` already covers the outcome
 * mapping itself; this is only the thin glue on top of it.
 */

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/db/auth", () => ({ signIn: vi.fn(), signUp: vi.fn() }));

function formData(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

beforeEach(() => {
  vi.mocked(redirect).mockClear();
});

describe("signUpAction", () => {
  it("redirects to the app home on a signed-in outcome, not to the landing page", async () => {
    vi.mocked(signUp).mockResolvedValue({
      status: "signed-in",
      account: { id: "u1", email: "a@example.com" },
    });

    await signUpAction(formData({ email: "a@example.com", password: "correct horse battery staple" }));

    expect(signUp).toHaveBeenCalledWith("a@example.com", "correct horse battery staple");
    expect(redirect).toHaveBeenCalledWith("/methods");
  });

  it("redirects to the confirmation-sent state, not /", async () => {
    vi.mocked(signUp).mockResolvedValue({
      status: "confirmation-required",
      account: { id: "u1", email: "a@example.com" },
    });

    await signUpAction(formData({ email: "a@example.com", password: "correct horse battery staple" }));

    expect(redirect).toHaveBeenCalledWith("/signup?sent=1");
  });

  it("redirects back to /signup with the error encoded, creating no session", async () => {
    vi.mocked(signUp).mockResolvedValue({ status: "error", error: "Password too short" });

    await signUpAction(formData({ email: "a@example.com", password: "x" }));

    expect(redirect).toHaveBeenCalledWith("/signup?error=Password%20too%20short");
  });
});

describe("signInAction", () => {
  it("redirects to the app home on success — ADR-0010, signing in lands on /methods", async () => {
    vi.mocked(signIn).mockResolvedValue({
      status: "signed-in",
      account: { id: "u1", email: "a@example.com" },
    });

    await signInAction(formData({ email: "a@example.com", password: "correct horse battery staple" }));

    expect(redirect).toHaveBeenCalledWith("/methods");
  });

  it("redirects back to /login with the error encoded, on invalid credentials", async () => {
    vi.mocked(signIn).mockResolvedValue({ status: "error", error: "Invalid login credentials" });

    await signInAction(formData({ email: "a@example.com", password: "wrong" }));

    expect(redirect).toHaveBeenCalledWith("/login?error=Invalid%20login%20credentials");
  });
});
