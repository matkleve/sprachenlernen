import type { ReactNode } from "react";

/**
 * The public half's landmark. The signed-in half puts `id="main"` on the shell's
 * content region instead, so the skip link in the root layout always lands past
 * navigation — never inside a header.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <main id="main">{children}</main>;
}
