import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/db/client";
import { routes } from "@/lib/routes";

/**
 * Finishes email confirmation (and other PKCE auth flows) after the user
 * follows the link in the mail. Contract: docs/specs/service/auth.md
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? routes.appHome;

  // Reject open redirects — only same-origin paths are allowed.
  const destination = next.startsWith("/") ? next : routes.appHome;

  if (!code) {
    return NextResponse.redirect(
      new URL(`${routes.signIn}?error=${encodeURIComponent("Missing confirmation code.")}`, url.origin),
    );
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(
        `${routes.signIn}?error=${encodeURIComponent(error.message)}`,
        url.origin,
      ),
    );
  }

  return NextResponse.redirect(new URL(destination, url.origin));
}
