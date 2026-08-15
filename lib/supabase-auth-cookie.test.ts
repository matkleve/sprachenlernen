// @vitest-environment node

import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { requestHasSupabaseAuthCookie } from "./supabase-auth-cookie";

describe("requestHasSupabaseAuthCookie", () => {
  it("is false when no Supabase auth cookie is present", () => {
    const request = new NextRequest("https://example.test/");
    expect(requestHasSupabaseAuthCookie(request)).toBe(false);
  });

  it("is true when a Supabase auth cookie is present", () => {
    const request = new NextRequest("https://example.test/");
    request.cookies.set("sb-project-auth-token", "session");
    expect(requestHasSupabaseAuthCookie(request)).toBe(true);
  });
});
