import { join } from "node:path";

/** Shared language config for starter-deck build scripts. */
export const POOL_SIZE = Number(process.env.POOL_SIZE ?? 2000);

export const LANGS = {
  es: {
    language: "es",
    label: "Spanish",
    formPrompt: "write the Spanish form",
    kaikki: {
      url: "https://kaikki.org/dictionary/Spanish/kaikki.org-dictionary-Spanish.jsonl",
      file: "kaikki-es.jsonl",
      licence: "CC BY-SA 3.0",
    },
  },
  it: {
    language: "it",
    label: "Italian",
    formPrompt: "write the Italian form",
    kaikki: {
      url: "https://kaikki.org/dictionary/Italian/kaikki.org-dictionary-Italian.jsonl",
      file: "kaikki-it.jsonl",
      licence: "CC BY-SA 3.0",
    },
  },
};

export function resolveLang(argvLang) {
  const code = (argvLang ?? process.env.STARTER_LANG ?? "es").toLowerCase();
  const config = LANGS[code];
  if (!config) {
    throw new Error(`unsupported language "${code}" — expected one of: ${Object.keys(LANGS).join(", ")}`);
  }
  return { code, config };
}

export function pathsFor(root, code) {
  const prefix = join(root, "data/starter", `${code}-meaning-recall`);
  return {
    frequency: join(root, "data/frequency", `${code}.txt`),
    lemmaTable: join(root, "data/lemma", `${code}.json`),
    overrides: `${prefix}.overrides.json`,
    exclusions: `${prefix}.exclusions.json`,
    cognates: `${prefix}.cognates.json`,
    output: `${prefix}.json`,
    formRecallOutput: join(root, "data/starter", `${code}-form-recall.json`),
  };
}
