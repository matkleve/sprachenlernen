import type { ReactNode } from "react";

import { AppShell } from "@/features/app-shell/AppShell";
import { requireAccount } from "@/features/app-shell/gate";

/**
 * The signed-in half of the app (ADR-0010). Every route in this group is
 * behind an account and inside the shell; the public half is app/(marketing)/
 * and gets neither. Route groups do not appear in the URL.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  await requireAccount();

  return <AppShell>{children}</AppShell>;
}
