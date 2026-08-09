"use server";

import { redirect } from "next/navigation";

import { signOut } from "@/lib/db/auth";
import { routes } from "@/lib/routes";

/**
 * Contract: docs/specs/feature/app-shell.md
 *
 * A Server Action bound to a form, so signing out is a POST and cannot happen
 * because something prefetched a link.
 *
 * A failed sign-out throws rather than redirecting: landing on `/` while the
 * session cookie is still valid would show the public page to somebody the app
 * still considers signed in, which is a silent failure of exactly the kind
 * CONSTITUTION.md §3 rules out. The error boundary is loud and correct.
 */
export async function signOutAction(): Promise<void> {
  const result = await signOut();
  if (result.status === "error") throw new Error(result.error);
  redirect(routes.landing);
}
