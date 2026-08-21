/**
 * LLM rewrite for T2 catalogue adaptation.
 * Contract: docs/specs/service/content-adaptation.md (T-CI3/T-CI4)
 */
import type { AdaptationRewriteInput, AdaptationRewriteFn } from "@/lib/catalogue-adaptation";

const OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";

function buildPrompt(input: AdaptationRewriteInput): string {
  return [
    `Rewrite the following ${input.languageCode} news text for CEFR ${input.targetLevel}.`,
    "Keep facts; simplify vocabulary and sentence structure.",
    "Output only the rewritten article body — no title, no commentary.",
    "",
    input.originalBody,
  ].join("\n");
}

export async function rewriteWithOpenAI(input: AdaptationRewriteInput): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) {
    throw new Error("OPENAI_API_KEY is required for LLM adaptation.");
  }

  const model = process.env.ADAPTATION_MODEL?.trim() || DEFAULT_MODEL;
  const response = await fetch(OPENAI_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You simplify news articles for language learners. Preserve factual meaning; do not invent events.",
        },
        { role: "user", content: buildPrompt(input) },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`LLM adaptation failed (${response.status}): ${detail.slice(0, 200)}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("LLM adaptation returned empty body.");
  return content;
}

/** Offline batch fixture — predictable A2 body for cache warm-up without API cost. */
export async function rewriteWithFixture(input: AdaptationRewriteInput): Promise<string> {
  if (input.targetLevel === "B1") {
    return "Las autoridades electorales de Egipto mantienen la prohibición de observadores internacionales en las elecciones. El presidente Mubarak busca otro período de seis años. Durante la campaña, los egipcios debaten el desempleo y la corrupción.";
  }
  return "Las autoridades de Egipto no permiten observadores en las elecciones. Mubarak quiere gobernar seis años más. La gente habla del desempleo y la corrupción en el país.";
}

export function createAdaptationRewrite(): AdaptationRewriteFn {
  const mode = process.env.ADAPTATION_REWRITE?.trim() ?? "openai";
  if (mode === "fixture") return rewriteWithFixture;
  if (mode === "openai") return rewriteWithOpenAI;
  throw new Error(`Unknown ADAPTATION_REWRITE mode: ${mode}`);
}
