import { lookupForm } from "@/lib/sentence-realizer/inverse-index";
import { SPANISH_PRESENT_PERSONS } from "@/lib/sentence-realizer/persons";
import type {
  FinitePerson,
  RealizerContext,
  RenderedSentence,
  SentencePlan,
} from "@/lib/sentence-realizer/types";

function spanishDeterminer(gender: "m" | "f", number: "sg" | "pl"): string {
  if (gender === "m") return number === "sg" ? "el" : "los";
  return number === "sg" ? "la" : "las";
}

function renderObjectPhrase(
  plan: SentencePlan,
  ctx: RealizerContext,
): { phrase: string | null; error: boolean } {
  if (!plan.object) return { phrase: null, error: false };

  const number = plan.object.number ?? "sg";
  const gender = ctx.lemmaGender.get(plan.object.lemma) ?? "m";
  const nounForm = lookupForm(ctx.index, plan.object.lemma, "noun", number);
  if (!nounForm) return { phrase: null, error: true };

  return {
    phrase: `${spanishDeterminer(gender, number)} ${nounForm}`,
    error: false,
  };
}

export function renderSpanishPlan(
  plan: SentencePlan,
  person: FinitePerson,
  ctx: RealizerContext,
): RenderedSentence | null {
  const verbForm = lookupForm(ctx.index, plan.verb.lemma, "verb", person.cell);
  if (!verbForm) return null;

  const object = renderObjectPhrase(plan, ctx);
  if (object.error) return null;

  const parts = [person.pronoun, verbForm, object.phrase].filter(Boolean);
  const text = `${parts.join(" ")}.`;

  return {
    personId: person.id,
    cell: person.cell,
    pronoun: person.pronoun,
    verbForm,
    objectPhrase: object.phrase,
    text,
  };
}

export function renderSpanishPlanAllPersons(
  plan: SentencePlan,
  ctx: RealizerContext,
): RenderedSentence[] {
  const rows: RenderedSentence[] = [];
  for (const person of SPANISH_PRESENT_PERSONS) {
    const rendered = renderSpanishPlan(plan, person, ctx);
    if (rendered) rows.push(rendered);
  }
  return rows;
}
