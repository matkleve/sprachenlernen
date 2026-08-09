import { redirect } from "next/navigation";

import { getAccount, type Account } from "@/lib/db/auth";
import { routes } from "@/lib/routes";

/**
 * The account gate for everything under app/(app)/. Contract:
 * docs/specs/feature/app-shell.md
 *
 * Lives in the layout rather than in each page, because a route added later
 * inherits the gate by being in the group — the failure mode of per-page checks
 * is the page somebody forgets. ADR-0006 makes an account mandatory, and
 * ADR-0010 puts every signed-in surface in this group, so the group boundary
 * and the auth boundary are deliberately the same line.
 */
export async function requireAccount(): Promise<Account> {
  const account = await getAccount();
  if (!account) redirect(routes.signIn);
  return account;
}
