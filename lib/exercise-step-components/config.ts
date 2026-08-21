/**
 * Typed readers for `step.config`. Contract:
 * docs/specs/service/exercise-step-components.md
 *
 * A recipe hands a component `Record<string, unknown>`. Every component used to
 * re-implement `typeof config.word === "string" ? config.word : ""` inline,
 * which meant renaming a key in a composer produced an empty screen and a green
 * test suite. These readers make the same mistake a *result*, so the runner can
 * say so out loud.
 */

export type ConfigParse<TConfig> =
  | { ok: true; config: TConfig }
  /** Keys the component needs and the recipe did not supply. */
  | { ok: false; missing: readonly string[] };

export type ConfigReader = {
  /** Required string — records the key as missing when absent or empty. */
  required: (key: string) => string;
  string: (key: string, fallback?: string) => string;
  number: (key: string, fallback?: number) => number | undefined;
  boolean: (key: string, fallback?: boolean) => boolean | undefined;
  strings: (key: string) => string[];
  raw: Record<string, unknown>;
};

/**
 * Builds a config with a reader, collecting missing required keys as it goes.
 * Reading everything before failing means the error names *all* the missing
 * keys, not just the first — one round trip per fix is enough.
 */
export function parseWith<TConfig>(
  raw: Record<string, unknown>,
  build: (read: ConfigReader) => TConfig,
): ConfigParse<TConfig> {
  const missing: string[] = [];

  const read: ConfigReader = {
    raw,
    required: (key) => {
      const value = raw[key];
      if (typeof value === "string" && value.trim().length > 0) return value;
      missing.push(key);
      return "";
    },
    string: (key, fallback = "") =>
      typeof raw[key] === "string" ? (raw[key] as string) : fallback,
    number: (key, fallback) => (typeof raw[key] === "number" ? (raw[key] as number) : fallback),
    boolean: (key, fallback) =>
      typeof raw[key] === "boolean" ? (raw[key] as boolean) : fallback,
    strings: (key) =>
      Array.isArray(raw[key])
        ? (raw[key] as unknown[]).filter((item): item is string => typeof item === "string")
        : [],
  };

  const config = build(read);
  return missing.length > 0 ? { ok: false, missing } : { ok: true, config };
}

/** For components that read their config directly and validate nothing. */
export function passthrough(
  raw: Record<string, unknown>,
): ConfigParse<Record<string, unknown>> {
  return { ok: true, config: raw };
}
