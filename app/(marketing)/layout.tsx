import type { ReactNode } from "react";

import { PublicHeader } from "@/features/marketing/PublicHeader";
import { getAccount } from "@/lib/db/auth";

/**
 * The public half's landmark. The signed-in half puts `id="main"` on the shell's
 * content region instead, so the skip link in the root layout always lands past
 * navigation — never inside a header.
 */
export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const account = await getAccount();

  return (
    <>
      <PublicHeader signedIn={account !== null} />
      <main id="main">{children}</main>
    </>
  );
}
