/** Shared with lib/description-keys.ts — keep in sync for export scripts. */

export function cardDescriptionKey(wordId, taskType, face) {
  return `card.${wordId}.${taskType}.${face}`;
}

export function sentenceTextKey(sentenceId) {
  return `sentence.${sentenceId}.text`;
}

export function sentenceTranslationKey(sentenceId) {
  return `sentence.${sentenceId}.translation`;
}

export function taskTypeFromTaskId(taskId) {
  const colon = taskId.lastIndexOf(":");
  return colon === -1 ? taskId : taskId.slice(colon + 1);
}

export function descriptionFaceForTaskType(taskType) {
  return taskType === "form-recall" ? "front" : "back";
}
