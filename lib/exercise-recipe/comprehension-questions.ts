/**
 * Comprehension checks for reading recipes — v1 uses fixture-specific questions.
 * Contract: docs/specs/service/exercise-recipe-composer.md
 */
export type ComprehensionQuestionOption = {
  id: string;
  label?: string;
  labelKey?: string;
};

export type ComprehensionQuestion = {
  id: string;
  prompt?: string;
  promptKey?: string;
  options: readonly ComprehensionQuestionOption[];
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

/** Self-assessment when no source-specific questions exist — keys resolved in UI locale. */
const FALLBACK_QUESTIONS: ComprehensionQuestion[] = [
  {
    id: "read-whole",
    promptKey: "comprehensionReadWholePrompt",
    options: [
      { id: "yes", labelKey: "comprehensionReadWholeYes" },
      { id: "partly", labelKey: "comprehensionReadWholePartly" },
      { id: "no", labelKey: "comprehensionReadWholeNo" },
    ],
  },
  {
    id: "main-idea",
    promptKey: "comprehensionMainIdeaPrompt",
    options: [
      { id: "yes", labelKey: "comprehensionMainIdeaYes" },
      { id: "partly", labelKey: "comprehensionMainIdeaPartly" },
      { id: "no", labelKey: "comprehensionMainIdeaNo" },
    ],
  },
];

export function comprehensionQuestionsForSource(sourceId: string): ComprehensionQuestion[] {
  return QUESTIONS_BY_SOURCE[sourceId] ?? FALLBACK_QUESTIONS;
}
