import type { Metadata } from "next";

import { MethodCardAssetLab } from "@/features/method-menu/MethodCardAssetLab";

export const metadata: Metadata = {
  title: "Method card assets (dev)",
  robots: { index: false, follow: false },
};

export default function MethodCardAssetsDevPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 pt-page-top pb-page-bottom">
      <header className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-widest text-muted">Dev</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-ink">Method card assets</h1>
        <p className="mt-4 text-base text-muted">
          Shield slice QA and section banner crop — compare PNG output to production card chrome.
        </p>
      </header>
      <div className="mt-page-content">
        <MethodCardAssetLab />
      </div>
    </div>
  );
}
