/**
 * v1 form-exercise fixtures — server-side recipe content for P2 methods.
 * Contract: docs/specs/service/exercise-recipe-composer.methods.md
 */
export type BuildSentenceItem = {
  word: string;
  hint: string;
  exemplar: string;
};

export type ClozeItem = {
  before: string;
  after: string;
  answer: string;
};

export type MinimalPairItem = {
  optionA: string;
  optionB: string;
  correctId: "a" | "b";
  prompt: string;
};

type LanguageFixtures = {
  buildSentence: BuildSentenceItem[];
  cloze: ClozeItem[];
  minimalPairs: MinimalPairItem[];
};

const ES: LanguageFixtures = {
  buildSentence: [
    { word: "casa", hint: "house", exemplar: "Mi casa es pequeña." },
    { word: "mesa", hint: "table", exemplar: "El café está en la mesa." },
    { word: "grande", hint: "big", exemplar: "La casa es grande." },
  ],
  cloze: [
    { before: "El café está en la", after: ".", answer: "mesa" },
    { before: "La casa es", after: ".", answer: "grande" },
    { before: "El gobierno anuncia nuevas", after: ".", answer: "medidas" },
  ],
  minimalPairs: [
    {
      optionA: "pero",
      optionB: "perro",
      correctId: "b",
      prompt: "Which word means dog?",
    },
    {
      optionA: "casa",
      optionB: "caza",
      correctId: "a",
      prompt: "Which word means house?",
    },
    {
      optionA: "mesa",
      optionB: "mes",
      correctId: "a",
      prompt: "Which word means table?",
    },
  ],
};

const IT: LanguageFixtures = {
  buildSentence: [
    { word: "casa", hint: "house", exemplar: "La mia casa è piccola." },
    { word: "tavolo", hint: "table", exemplar: "Il caffè è sul tavolo." },
  ],
  cloze: [
    { before: "La casa è", after: ".", answer: "grande" },
    { before: "Il governo annuncia nuove", after: ".", answer: "misure" },
  ],
  minimalPairs: [
    {
      optionA: "pero",
      optionB: "perro",
      correctId: "b",
      prompt: "Which word sounds like perro (not shipped Italian pair — tap B)?",
    },
  ],
};

const BY_LANG: Record<string, LanguageFixtures> = { es: ES, it: IT };

export function formExerciseFixtures(languageCode: string): LanguageFixtures {
  return BY_LANG[languageCode] ?? ES;
}
