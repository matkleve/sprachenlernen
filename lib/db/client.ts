import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * The Supabase client boundary. Contract: docs/specs/service/auth.md
 *
 * ADR-0007 commits to Supabase and to a single adapter that imports its SDK —
 * this file is that seam. Nothing outside `lib/db/` may import
 * `@supabase/supabase-js` or `@supabase/ssr` directly (BACKEND.md §3).
 *
 * Two clients, because they run in different places and read the session
 * differently:
 * - the browser client reads/writes the session from the browser's own
 *   cookie jar (used only if a Client Component ever needs Supabase directly,
 *   e.g. a realtime subscription — nothing in this codebase does yet);
 * - the server client reads/writes the session via Next's cookie store, so
 *   Server Components, Server Actions and Route Handlers see the same
 *   sign-in state the browser does.
 *
 * Follows Supabase's current SSR guidance exactly: `getAll`/`setAll` only.
 * The older per-cookie `get`/`set`/`remove` shape is deprecated and silently
 * breaks session persistence — see
 * https://github.com/supabase/supabase/blob/master/examples/prompts/nextjs-supabase-auth.md
 */

function supabaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set — see .env.example");
  return value;
}

function supabasePublishableKey(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!value) {
    throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not set — see .env.example");
  }
  return value;
}

export function createBrowserSupabaseClient() {
  return createBrowserClient(supabaseUrl(), supabasePublishableKey());
}

/**
 * The server client for the current request. Must be created fresh per
 * request (it closes over that request's cookies) — never cached at module
 * scope, or every request would share one user's session.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl(), supabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component, which cannot write cookies.
          // Harmless as long as middleware.ts is refreshing the session on
          // every request — see docs/specs/service/auth.md § Session handling.
        }
      },
    },
  });
}
