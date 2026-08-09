import type { ReactNode } from "react";

import { PublicHeader } from "@/features/marketing/PublicHeader";

/**
 * The public half's landmark. The signed-in half puts `id="main"` on the shell's
 * content region instead, so the skip link in the root layout always lands past
 * navigation — never inside a header.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicHeader />
      <main id="main">{children}</main>
    </>
  );
}
