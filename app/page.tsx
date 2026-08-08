import { Button } from "@/components/ui/Button";
import { ItemPicker } from "@/features/item-picker/ItemPicker";
import { sampleItems } from "@/features/item-picker/content";
import { PrimitivesDemo } from "@/features/primitives/PrimitivesDemo";

/**
 * A page composes features and passes them data. It holds no logic — logic in a
 * page.tsx is logic no test can reach without a router (docs/ARCHITECTURE.md).
 *
 * Replace all of this when you start a real project. It exists to prove the
 * stack builds and to show the conventions in one screen.
 */
export default function Home() {
  return (
    <div className="mx-auto max-w-4xl px-6 pt-page-top pb-page-bottom">
      <p className="text-sm font-medium uppercase tracking-widest text-accent">
        Grundriss
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink">
        The plan comes before the building
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        A base project where the specification is the source of truth, the process
        scales with risk, and every rule that matters is enforced by a command you
        can run. Start at <code className="font-mono text-sm text-ink">AGENTS.md</code>.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button>Primary action</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Button disabled>Disabled</Button>
      </div>

      <section className="mt-page-content">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-muted">
          Worked example — one source, many surfaces
        </h2>
        <ItemPicker items={sampleItems} />
      </section>

      <section className="mt-page-content">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-muted">
          Primitives
        </h2>
        <PrimitivesDemo />
      </section>
    </div>
  );
}
