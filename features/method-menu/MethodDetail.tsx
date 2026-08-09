import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { byId, type MethodEntry } from "@/lib/method-catalogue";
import type { SearchParams } from "@/lib/method-menu-filter";
import { menuQueryString } from "@/lib/method-menu-filter";
import { routes } from "@/lib/routes";

import { copy, evidence, intensity, sections } from "./content";
import { durationChips, requirementChips } from "./requirements";

export type MethodDetailProps = {
  method?: MethodEntry;
  searchParams?: SearchParams;
};

export function MethodDetail({ method, searchParams = {} }: MethodDetailProps) {
  const backHref = `${routes.methods}${menuQueryString(searchParams)}`;

  if (!method) {
    return (
      <div className="mx-auto max-w-2xl px-6 pt-page-top pb-page-bottom">
        <p className="text-base text-muted">{copy.methodNotFound}</p>
        <Link href={backHref} className="mt-4 inline-block text-sm font-medium text-ink underline">
          {copy.backToMethods}
        </Link>
      </div>
    );
  }

  const requirements = requirementChips(method.requires);

  return (
    <div className="mx-auto max-w-2xl px-6 pt-page-top pb-page-bottom">
      <Link href={backHref} className="text-sm font-medium text-muted hover:text-ink">
        ← {copy.backToMethods}
      </Link>

      <p className="mt-6 text-sm font-medium uppercase tracking-widest text-muted">
        {sections[method.section]}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">{method.name}</h1>
      <p className="mt-3 text-base leading-relaxed text-muted">{method.summary}</p>

      <ul className="mt-6 flex flex-wrap gap-1.5" aria-label={copy.card.properties}>
        {durationChips(method.durations).map((label) => (
          <li key={`duration-${label}`}>
            <Chip>{label}</Chip>
          </li>
        ))}
        {requirements.map((label) => (
          <li key={`need-${label}`}>
            <Chip>{label}</Chip>
          </li>
        ))}
        <li>
          <Chip tone="accent">{intensity[method.intensity]}</Chip>
        </li>
        <li>
          <Chip tone="accent">{evidence[method.evidence]}</Chip>
        </li>
        <li>
          <Chip>{method.hosted ? copy.hostedShort : copy.notHostedShort}</Chip>
        </li>
      </ul>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-ink">{copy.card.trains}</h2>
        <p className="mt-1 text-base text-muted">{method.trains}</p>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-medium text-ink">{copy.card.doesNotDo}</h2>
        <p className="mt-1 text-base text-muted">{method.doesNotDo}</p>
      </section>

      <p className="mt-6 text-sm text-muted">
        {method.hosted ? copy.hosted : copy.notHosted}
      </p>

      {method.hosted && (
        <Button className="mt-8" disabled>
          {copy.startUnavailable}
        </Button>
      )}
    </div>
  );
}

export function findMethod(
  catalogue: { entries: { id: string }[] } | undefined,
  id: string,
): MethodEntry | undefined {
  if (!catalogue) return undefined;
  const entry = byId(catalogue as Parameters<typeof byId>[0], id);
  return entry?.type === "method" ? entry : undefined;
}
