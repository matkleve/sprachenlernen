import type { NextRequest } from "next/server";

/**
 * True when the request carries a Supabase session cookie. Used to skip an
 * auth round-trip on anonymous public pages (middleware fast path).
 */
export function requestHasSupabaseAuthCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some((cookie) => cookie.name.includes("-auth-token"));
}
