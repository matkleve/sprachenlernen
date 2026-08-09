import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { requiresAccount, routes } from "@/lib/routes";

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
 * **And turns a signed-out request for a protected route away before anything
 * renders.** The gate in `app/(app)/layout.tsx` is not enough on its own, and
 * the reason is worth keeping: a layout's `redirect()` runs concurrently with
 * the page beneath it, so by the time it wins, the page has already been
 * rendered into the response — the whole method menu ships in the body of the
 * 307. Add a `loading.tsx` above it and the shell flushes first and the status
 * is not even a 307 any more, it is a 200. Measured, not theorised; see
 * docs/TRAPS.md. Middleware runs before any of that.
 *
 * The layout gate stays as well, so a route cannot render without an account
 * even if this matcher ever stops covering it. Both read the same list in
 * `lib/routes.ts`, so there is one place to add a destination.
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && requiresAccount(request.nextUrl.pathname)) {
    const signIn = request.nextUrl.clone();
    signIn.pathname = routes.signIn;
    // No `?next=` yet: where to return to after signing in is a decision
    // docs/specs/service/auth.md has not made, and guessing it here would put
    // it in the codebase with an authority nobody granted it.
    signIn.search = "";
    return NextResponse.redirect(signIn);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
