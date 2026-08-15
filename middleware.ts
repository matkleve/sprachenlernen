import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { readSupabaseEnv } from "@/lib/db/env";
import { createReferenceId } from "@/lib/errors";
import { isPublicRoute, requiresAccount, routes } from "@/lib/routes";
import { requestHasSupabaseAuthCookie } from "@/lib/supabase-auth-cookie";

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
 * The layout gate in `app/(app)/layout.tsx` stays as a backstop only — it cannot
 * prevent content leaking into a redirect response. Both read `requiresAccount()`
 * from `lib/routes.ts`, which gates every route that is not explicitly public.
 *
 * Pattern is Supabase's current one for `@supabase/ssr` — `getAll`/`setAll`
 * only, never the deprecated per-cookie `get`/`set`/`remove`:
 * https://github.com/supabase/supabase/blob/master/examples/prompts/nextjs-supabase-auth.md
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requestId = request.headers.get("x-request-id") ?? createReferenceId();

  const withRequestId = (response: NextResponse) => {
    response.headers.set("x-request-id", requestId);
    return response;
  };

  // A deployment with no Supabase env must not 500 every request — Vercel
  // previews are often wired before the secrets are. The public half still
  // renders; protected routes redirect to sign-in, where the form will error
  // until the env is set.
  const supabaseEnv = readSupabaseEnv();
  if (!supabaseEnv) {
    if (requiresAccount(pathname)) {
      const signIn = request.nextUrl.clone();
      signIn.pathname = routes.signIn;
      signIn.search = "";
      return withRequestId(NextResponse.redirect(signIn));
    }
    return withRequestId(NextResponse.next());
  }

  // Anonymous visitors on public pages do not need a Supabase round-trip — bots
  // and cold landing traffic hit this path on every crawl.
  if (isPublicRoute(pathname) && !requestHasSupabaseAuthCookie(request)) {
    return withRequestId(NextResponse.next());
  }

  let response = NextResponse.next({ request });
  response.headers.set("x-request-id", requestId);

  const supabase = createServerClient(supabaseEnv.url, supabaseEnv.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        response.headers.set("x-request-id", requestId);
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Do not remove, and do not add code between createServerClient and this
  // call — see the file-level comment above.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && requiresAccount(pathname)) {
    const signIn = request.nextUrl.clone();
    signIn.pathname = routes.signIn;
    // No `?next=` yet: where to return to after signing in is a decision
    // docs/specs/service/auth.md has not made, and guessing it here would put
    // it in the codebase with an authority nobody granted it.
    signIn.search = "";
    return withRequestId(NextResponse.redirect(signIn));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
