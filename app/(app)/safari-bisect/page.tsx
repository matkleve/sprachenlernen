import type { Metadata } from "next";

import { SafariBisectHub } from "@/features/safari-bisect/SafariBisectHub";
import { copy } from "@/features/safari-bisect/content";

export const metadata: Metadata = {
  title: copy.hubTitle,
  robots: { index: false, follow: false },
};

export default function SafariBisectHubPage() {
  return <SafariBisectHub />;
}
