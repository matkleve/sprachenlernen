/**
 * Sentence plan IR for the Spanish realizer v1.
 * Contract: dev tooling + future card-example-sentence fallback.
 */

export type FinitePersonId = "1sg" | "2sg" | "3sg" | "1pl" | "2pl" | "3pl";

export type FinitePerson = {
  id: FinitePersonId;
  label: string;
  pronoun: string;
  cell: string;
};

export type SentencePlan = {
  id: string;
  languageCode: "es";
  label?: string;
  verb: { lemma: string };
  object?: { lemma: string; number?: "sg" | "pl" };
  world?: string;
};

export type SentencePlanBank = {
  plans: SentencePlan[];
};

export type RenderedSentence = {
  personId: FinitePersonId;
  cell: string;
  pronoun: string;
  verbForm: string;
  objectPhrase: string | null;
  text: string;
};

export type RealizerContext = {
  index: ReadonlyMap<string, string>;
  lemmaGender: ReadonlyMap<string, "m" | "f">;
};
