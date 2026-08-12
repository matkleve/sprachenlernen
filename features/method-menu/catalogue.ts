/**
 * Reads the shipped Method catalogue off disk. Contract:
 * docs/specs/page/method-menu.md
 *
 * The I/O lives here rather than in lib/, because lib/ is framework- and
 * I/O-free by construction (AGENTS.md) — `loadCatalogue` takes parsed input and
 * returns errors, and somebody has to be the one that opens the file. Same
 * shape and same reason as features/language-status/profiles.ts.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SECTIONS,
  loadCatalogue,
  loadPresets,
  type Catalogue,
  type Preset,
} from "@/lib/method-catalogue";

export type LoadedMenu = {
  catalogue?: Catalogue;
  presets?: Preset[];
  errors: string[];
};

export const METHODS_DIR = "data/methods";

function loadMethodCatalogueFromDisk(root: string): LoadedMenu {
  const dir = join(root, METHODS_DIR);
  const errors: string[] = [];

  const read = (file: string): unknown | undefined => {
    try {
      return JSON.parse(readFileSync(join(dir, file), "utf8"));
    } catch (error) {
      // Named rather than skipped: a section that failed to open and a section
      // that does not exist must not look the same on the page.
      errors.push(`${file}: ${(error as Error).message}`);
      return undefined;
    }
  };

  const sectionFiles = SECTIONS.map((section) => read(`${section}.json`)).filter(
    (input): input is unknown => input !== undefined,
  );
  const presetFile = read("presets.json");

  const { catalogue, errors: catalogueErrors } = loadCatalogue(sectionFiles);
  const { presets, errors: presetErrors } = presetFile
    ? loadPresets(presetFile)
    : { presets: undefined, errors: [] };

  return { catalogue, presets, errors: [...errors, ...catalogueErrors, ...presetErrors] };
}

let productionMenu: LoadedMenu | undefined;

/**
 * `root` is a parameter so a test can point at a fixture directory. Production
 * passes nothing and gets the repository root, which is where Next builds from.
 *
 * The catalogue is static at runtime — parsing nine JSON files from disk on
 * every `/methods` visit was pure overhead after the first load in a process.
 */
export const loadMethodCatalogue = (root: string = process.cwd()): LoadedMenu => {
  if (root === process.cwd()) {
    productionMenu ??= loadMethodCatalogueFromDisk(root);
    return productionMenu;
  }

  return loadMethodCatalogueFromDisk(root);
};
