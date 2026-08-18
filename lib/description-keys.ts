/**
 * Stable keys for learner-facing description text. Contract:
 * docs/specs/service/app-texts.md
 */

export type CardFace = "back" | "front";

/** e.g. `card.it:fare.meaning-recall.back` */
export function cardDescriptionKey(wordId: string, taskType: string, face: CardFace): string {
  return `card.${wordId}.${taskType}.${face}`;
}

export function sentenceTextKey(sentenceId: string): string {
  return `sentence.${sentenceId}.text`;
}

export function sentenceTranslationKey(sentenceId: string): string {
  return `sentence.${sentenceId}.translation`;
}

/** `it:fare:meaning-recall` → `meaning-recall` */
export function taskTypeFromTaskId(taskId: string): string {
  const colon = taskId.lastIndexOf(":");
  return colon === -1 ? taskId : taskId.slice(colon + 1);
}

/** Meaning-recall gloss is on the back; form-recall prompt gloss is on the front. */
export function descriptionFaceForTaskType(taskType: string): CardFace {
  return taskType === "form-recall" ? "front" : "back";
}

export function descriptionKeyForTaskId(wordId: string, taskId: string): string {
  const taskType = taskTypeFromTaskId(taskId);
  return cardDescriptionKey(wordId, taskType, descriptionFaceForTaskType(taskType));
}
