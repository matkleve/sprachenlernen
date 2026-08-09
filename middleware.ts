import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session cookie on every request. Contract:
 * docs/specs/service/auth.md § Session handling.
 *
 * Server Components cannot write cookies (see lib/db/client.ts), so nothing
 * else in the app keeps the session's access token from expiring — this is
 * the only place that does. Removing it does not error; it just stops
 * refreshing sessions, which surfaces days later as "users get signed out
 * randomly" (see docs/TRAPS.md-style failures this is written to avoid).
 *
 * Deliberately does **not** redirect signed-out visitors anywhere, even now
 * that protected routes exist. The gate lives in `app/(app)/layout.tsx`
 * (docs/specs/feature/app-shell.md), because the route group and the auth
 * boundary are the same line by construction — a matcher pattern here would be
 * a second, hand-maintained copy of that list, and the failure mode is a route
 * added to the group that the pattern does not cover.
 *
 * Pattern is Supabase's current one for `@supabase/ssr` — `getAll`/`setAll`
 * only, never the deprecated per-cookie `get`/`set`/`remove`:
 * https://github.com/supabase/supabase/blob/master/examples/prompts/nextjs-supabase-auth.md
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not remove, and do not add code between createServerClient and this
  // call — see the file-level comment above.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
