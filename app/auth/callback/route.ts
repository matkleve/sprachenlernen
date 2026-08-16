import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/db/client";
import { ensureProfileFromAcceptLanguage } from "@/lib/db/profiles";
import { getSpokenLanguage } from "@/lib/db/profiles";
import {
  authConfirmationFailed,
  authConfirmationMissing,
  logHandledError,
  toUserFacing,
} from "@/lib/errors";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "@/lib/i18n/locale-cookie";
import { routes } from "@/lib/routes";

function loginRedirect(origin: string, handled: ReturnType<typeof authConfirmationMissing>) {
  logHandledError(handled);
  const facing = toUserFacing(handled);
  const params = new URLSearchParams({
    error: facing.userMessage,
    ref: facing.referenceId,
  });
  return NextResponse.redirect(new URL(`${routes.signIn}?${params}`, origin));
}

/**
 * Finishes email confirmation (and other PKCE auth flows) after the user
 * follows the link in the mail. Contract: docs/specs/service/auth.md
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? routes.appHome;

  const destination = next.startsWith("/") ? next : routes.appHome;

  if (!code) {
    return loginRedirect(url.origin, authConfirmationMissing());
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return loginRedirect(url.origin, authConfirmationFailed(error.message));
  }

  await ensureProfileFromAcceptLanguage(request.headers.get("accept-language"));

  const spoken = await getSpokenLanguage(supabase);
  const response = NextResponse.redirect(new URL(destination, url.origin));

  if (spoken.status === "ok") {
    response.cookies.set(LOCALE_COOKIE, spoken.spokenLanguage, {
      path: "/",
      maxAge: LOCALE_COOKIE_MAX_AGE,
      sameSite: "lax",
    });
  }

  return response;
}
