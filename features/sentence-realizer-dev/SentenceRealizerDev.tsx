import { ActionLink } from "@/components/ui/ActionLink";
import type { RenderedSentence, SentencePlan } from "@/lib/sentence-realizer/types";
import { routes } from "@/lib/routes";

type SentenceRealizerDevProps = {
  plan: SentencePlan;
  variants: RenderedSentence[];
  seed: number;
  copy: {
    eyebrow: string;
    title: string;
    description: string;
    anotherSentence: string;
    back: string;
    planLabel: string;
    tableCaption: string;
    personColumn: string;
    cellColumn: string;
    sentenceColumn: string;
    partialWarning: string;
  };
};

export function SentenceRealizerDev({ plan, variants, seed, copy }: SentenceRealizerDevProps) {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm font-medium uppercase tracking-widest text-muted">{copy.eyebrow}</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">{copy.title}</h1>
      <p className="mt-3 text-base text-muted">{copy.description}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <ActionLink
          href={`${routes.profileDevSentenceRealizer}?seed=${seed + 1}`}
          variant="secondary"
        >
          {copy.anotherSentence}
        </ActionLink>
        <ActionLink href={`${routes.profile}?section=dev`} variant="secondary">
          {copy.back}
        </ActionLink>
      </div>

      <div className="mt-8 rounded-panel border border-line bg-surface p-5">
        <p className="text-xs font-medium uppercase tracking-widest text-muted">{copy.planLabel}</p>
        <p className="mt-2 font-mono text-sm text-ink">{plan.id}</p>
        {plan.label ? <p className="mt-1 text-sm text-muted">{plan.label}</p> : null}
        <p className="mt-3 font-mono text-sm text-muted">
          verb={plan.verb.lemma}
          {plan.object ? ` · obj=${plan.object.lemma}` : ""}
          {plan.world ? ` · world=${plan.world}` : ""}
        </p>
      </div>

      <table className="mt-8 w-full border-collapse text-left text-sm">
        <caption className="sr-only">{copy.tableCaption}</caption>
        <thead>
          <tr className="border-b border-line text-muted">
            <th className="py-2 pr-4 font-medium">{copy.personColumn}</th>
            <th className="py-2 pr-4 font-medium">{copy.cellColumn}</th>
            <th className="py-2 font-medium">{copy.sentenceColumn}</th>
          </tr>
        </thead>
        <tbody>
          {variants.map((row) => (
            <tr key={row.personId} className="border-b border-line align-top">
              <td className="py-3 pr-4 font-mono text-ink">{row.personId}</td>
              <td className="py-3 pr-4 font-mono text-muted">{row.cell}</td>
              <td className="py-3 text-ink">{row.text}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {variants.length < 6 ? (
        <p className="mt-4 text-sm text-warning" role="status">
          {copy.partialWarning}
        </p>
      ) : null}
    </div>
  );
}
