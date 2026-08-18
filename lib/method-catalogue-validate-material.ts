import { ID_PATTERN, isNonEmptyString, isRecord } from "./learning-context";

/** Validates optional materialTopics and materialUnits on a method entry. */
export function validateMaterialFields(
  input: Record<string, unknown>,
  where: string,
  errors: string[],
): void {
  if (input.materialTopics !== undefined) {
    if (!Array.isArray(input.materialTopics) || input.materialTopics.length === 0) {
      errors.push(`${where}.materialTopics: must be a non-empty array when present`);
    } else {
      input.materialTopics.forEach((topic, topicIndex) => {
        const topicWhere = `${where}.materialTopics[${topicIndex}]`;
        if (!isRecord(topic)) {
          errors.push(`${topicWhere}: must be an object`);
          return;
        }
        if (!isNonEmptyString(topic.id) || !ID_PATTERN.test(topic.id)) {
          errors.push(`${topicWhere}.id: required, lowercase kebab-case`);
        }
        if (!isNonEmptyString(topic.labelKey)) {
          errors.push(`${topicWhere}.labelKey: required non-empty string`);
        }
      });
    }
  }

  if (input.materialUnits !== undefined) {
    if (!Array.isArray(input.materialUnits) || input.materialUnits.length === 0) {
      errors.push(`${where}.materialUnits: must be a non-empty array when present`);
    } else {
      let defaultCount = 0;
      input.materialUnits.forEach((unit, unitIndex) => {
        const unitWhere = `${where}.materialUnits[${unitIndex}]`;
        if (!isRecord(unit)) {
          errors.push(`${unitWhere}: must be an object`);
          return;
        }
        if (!isNonEmptyString(unit.id)) {
          errors.push(`${unitWhere}.id: required non-empty string`);
        }
        if (unit.durationSec !== undefined) {
          if (typeof unit.durationSec !== "number" || !Number.isFinite(unit.durationSec)) {
            errors.push(`${unitWhere}.durationSec: must be a finite number when present`);
          }
        }
        if (unit.default === true) defaultCount += 1;
      });
      if (defaultCount > 1) {
        errors.push(`${where}.materialUnits: at most one unit may be default`);
      }
    }
  }
}
