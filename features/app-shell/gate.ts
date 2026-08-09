import { redirect } from "next/navigation";

import { getAccount, type Account } from "@/lib/db/auth";
import { routes } from "@/lib/routes";

/**
 * Backstop gate for everything under app/(app)/. Contract:
 * docs/specs/feature/app-shell.md
 *
 * The real boundary is `middleware.ts`, which runs before rendering; a layout's
 * `redirect()` does not stop the page beneath it from streaming into the body
 * (see docs/TRAPS.md). This layout gate catches a route the middleware matcher
 * stops covering — it is not sufficient on its own.
 */
export async function requireAccount(): Promise<Account> {
  const account = await getAccount();
  if (!account) redirect(routes.signIn);
  return account;
}
