/**
 * Comprehension checks for reading recipes — v1 uses fixture-specific questions.
 * Contract: docs/specs/service/exercise-recipe-composer.md
 */
export type ComprehensionQuestion = {
  id: string;
  prompt: string;
  options: readonly { id: string; label: string }[];
  correctOptionId?: string;
};

const QUESTIONS_BY_SOURCE: Record<string, ComprehensionQuestion[]> = {
  "es-catalogue-chile": [
    {
      id: "chile-topic",
      prompt: "¿De qué trata principalmente el texto?",
      options: [
        { id: "government", label: "Medidas del gobierno y la economía" },
        { id: "weather", label: "El tiempo en Santiago" },
        { id: "sport", label: "Un partido de fútbol" },
      ],
      correctOptionId: "government",
    },
    {
      id: "chile-economy",
      prompt: "¿Qué dice el texto sobre la economía?",
      options: [
        { id: "grows", label: "Crece este año" },
        { id: "falls", label: "Baja este año" },
        { id: "flat", label: "No cambia" },
      ],
      correctOptionId: "grows",
    },
  ],
  "es-fixture-cafe": [
    {
      id: "cafe-place",
      prompt: "¿Dónde está el café?",
      options: [
        { id: "table", label: "En la mesa" },
        { id: "street", label: "En la calle" },
        { id: "kitchen", label: "En la cocina" },
      ],
      correctOptionId: "table",
    },
    {
      id: "house-size",
      prompt: "¿Cómo es la casa?",
      options: [
        { id: "big", label: "Grande" },
        { id: "small", label: "Pequeña" },
        { id: "old", label: "Vieja" },
      ],
      correctOptionId: "big",
    },
  ],
};

const FALLBACK_QUESTIONS: ComprehensionQuestion[] = [
  {
    id: "read-whole",
    prompt: "Did you read the whole passage without stopping for long?",
    options: [
      { id: "yes", label: "Yes, mostly" },
      { id: "partly", label: "I stopped a few times" },
      { id: "no", label: "No — too hard" },
    ],
  },
  {
    id: "main-idea",
    prompt: "Could you follow the main idea?",
    options: [
      { id: "yes", label: "Yes" },
      { id: "partly", label: "Partly" },
      { id: "no", label: "Not really" },
    ],
  },
];

export function comprehensionQuestionsForSource(sourceId: string): ComprehensionQuestion[] {
  return QUESTIONS_BY_SOURCE[sourceId] ?? FALLBACK_QUESTIONS;
}
