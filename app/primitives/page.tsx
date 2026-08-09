import type { Metadata } from "next";

import { Button } from "@/components/ui/Button";
import { ItemPicker } from "@/features/item-picker/ItemPicker";
import { sampleItems } from "@/features/item-picker/content";
import { PrimitivesDemo } from "@/features/primitives/PrimitivesDemo";
import { page } from "@/features/primitives/content";

export const metadata: Metadata = {
  title: "Primitives",
};

/**
 * The starter's demo, moved off `/` (T-04). It stays reachable because the
 * documentation points at it — see T-B5 before deleting any of it.
 */
export default function PrimitivesPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 pt-page-top pb-page-bottom">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">{page.title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{page.intro}</p>

      <section className="mt-page-content">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-muted">
          {page.buttonsHeading}
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button>Primary action</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section className="mt-page-content">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-muted">
          {page.workedExampleHeading}
        </h2>
        <ItemPicker items={sampleItems} />
      </section>

      <section className="mt-page-content">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-muted">
          {page.primitivesHeading}
        </h2>
        <PrimitivesDemo />
      </section>
    </div>
  );
}
