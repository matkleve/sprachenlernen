import type { Metadata } from "next";

import { privacyContent } from "@/features/privacy/content";

export const metadata: Metadata = {
  title: privacyContent.title,
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 pt-page-top pb-page-bottom">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">{privacyContent.title}</h1>
      <p className="mt-4 text-base leading-relaxed text-muted">{privacyContent.intro}</p>
      <ul className="mt-page-content list-disc space-y-2 pl-5 text-base text-muted">
        {privacyContent.stores.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mt-page-content text-sm text-muted">{privacyContent.contact}</p>
      <p className="mt-4 text-sm text-muted">{privacyContent.accountLink}</p>
    </div>
  );
}
