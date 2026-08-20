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
  "wikinews-es-3516": [
    {
      id: "egypt-observers",
      prompt: "¿Qué decidió la Comisión Electoral Egipcia sobre los observadores?",
      options: [
        { id: "ban", label: "Mantener la prohibición de observadores" },
        { id: "allow", label: "Permitir observadores internacionales" },
        { id: "partial", label: "Permitir solo observadores nacionales" },
      ],
      correctOptionId: "ban",
    },
    {
      id: "egypt-candidate",
      prompt: "¿Quién se presenta como candidato presidencial?",
      options: [
        { id: "mubarak", label: "Hosni Mubarak" },
        { id: "galvez", label: "Xóchitl Gálvez" },
        { id: "chapo", label: "Daniel Chapo" },
      ],
      correctOptionId: "mubarak",
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
