/**
 * Cell-based form-recall task ids. Contract:
 * docs/specs/service/form-practice.md
 *
 * Legacy ids keep the surface form: `es:hablar:habla:form-recall`.
 * Cell ids name the paradigm cell: `es:hablar:verb:ind.pres.1pl:form-recall`.
 */

export type ParsedFormCellTaskId = {
  languageCode: string;
  lemma: string;
  pos: string;
  cell: string;
};

export function buildFormCellTaskId(
  languageCode: string,
  lemma: string,
  pos: string,
  cell: string,
): string {
  return `${languageCode}:${lemma}:${pos}:${cell}:form-recall`;
}

export function parseFormCellTaskId(taskId: string): ParsedFormCellTaskId | null {
  if (!taskId.endsWith(":form-recall")) return null;

  const body = taskId.slice(0, -":form-recall".length);
  const segments = body.split(":");
  if (segments.length < 4) return null;

  const cell = segments[segments.length - 1] ?? "";
  if (!cell.includes(".")) return null;

  const pos = segments[segments.length - 2] ?? "";
  const languageCode = segments[0] ?? "";
  const lemma = segments.slice(1, -2).join(":");
  if (!languageCode || !lemma || !pos || !cell) return null;

  return { languageCode, lemma, pos, cell };
}

export function isFormCellTaskId(taskId: string): boolean {
  return parseFormCellTaskId(taskId) !== null;
}

export function wordIdFromFormTaskId(taskId: string): string {
  const parsed = parseFormCellTaskId(taskId);
  if (parsed) return `${parsed.languageCode}:${parsed.lemma}`;

  if (!taskId.endsWith(":form-recall")) {
    throw new Error(`task_id has unexpected shape: ${taskId}`);
  }

  const withoutSuffix = taskId.slice(0, -":form-recall".length);
  const parts = withoutSuffix.split(":");
  if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
  throw new Error(`task_id has unexpected shape: ${taskId}`);
}
