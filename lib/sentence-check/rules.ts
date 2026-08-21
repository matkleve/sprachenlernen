/**
 * The four things the checker can prove. Contract:
 * docs/specs/service/sentence-check.md
 *
 * Every rule here obeys one law: a finding needs the clash to hold under
 * *every* reading the table allows. One innocent reading clears the token. That
 * is what keeps the checker usable on a fusional language, and it is the line
 * most likely to be "optimised" away by a later heuristic — it is load-bearing.
 */
import type { Analysis, LemmaTable } from "@/lib/lemma-table";

import { featuresAgree, formFor, nominalFeatures, verbPerson } from "./cells";
import type { LanguageRules } from "./languages";
import { isKnown, type SentenceToken } from "./tokens";
import type { SentenceFinding } from "./types";

const MODIFIERS: readonly Analysis["pos"][] = ["det", "adj"];

function readings(token: SentenceToken, pos: readonly Analysis["pos"][]): Analysis[] {
  return token.analyses.filter((analysis) => pos.includes(analysis.pos));
}

// --- spelling ---------------------------------------------------------------

function editDistanceAtMostOne(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  if (a === b) return false;

  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  let i = 0;
  let j = 0;
  let edits = 0;

  while (i < short.length && j < long.length) {
    if (short[i] === long[j]) {
      i += 1;
      j += 1;
      continue;
    }
    edits += 1;
    if (edits > 1) return false;
    if (short.length === long.length) i += 1;
    j += 1;
  }

  return true;
}

function nearestForm(table: LemmaTable, unknown: string): string | undefined {
  let found: string | undefined;

  for (const form of Object.keys(table.forms)) {
    if (!editDistanceAtMostOne(unknown, form)) continue;
    // A second candidate means we cannot tell which was meant, and guessing
    // between them is exactly the wrong feedback STUDY-006 warns about.
    if (found) return undefined;
    found = form;
  }

  return found;
}

export function spellingFindings(
  tokens: readonly SentenceToken[],
  table: LemmaTable,
): SentenceFinding[] {
  const findings: SentenceFinding[] = [];

  tokens.forEach((token, index) => {
    if (isKnown(token)) return;
    if (token.properNounCandidate) return;
    // `un'amica`, `dell'acqua`: the table stores the parts, not the elision.
    if (/['’]/.test(token.normalised)) {
      const parts = token.normalised.split(/['’]/).filter(Boolean);
      if (parts.every((part) => (table.forms[part]?.length ?? 0) > 0)) return;
    }

    const suggestion = nearestForm(table, token.normalised);
    findings.push({
      tokenIndex: index,
      category: "spelling",
      messageKey: suggestion ? "spellingWithSuggestion" : "spellingUnknown",
      messageValues: { word: token.text, ...(suggestion ? { suggestion } : {}) },
      ...(suggestion ? { suggestion } : {}),
    });
  });

  return findings;
}

// --- agreement --------------------------------------------------------------

/**
 * The likeliest reading, which the table stores first. Using it — rather than
 * "has a reading of this kind anywhere" — is what stops `son` (ser, but also
 * "el son") from being read as the noun a following adjective agrees with.
 */
function looksLike(token: SentenceToken, ...pos: readonly Analysis["pos"][]): boolean {
  const first = token.analyses[0];
  return first !== undefined && pos.includes(first.pos);
}

/**
 * The noun a determiner belongs to: scan forward across further modifiers
 * (`la gran casa`) to the first word that reads as a noun. Anything else ends
 * the phrase.
 */
function determinerHead(tokens: readonly SentenceToken[], from: number): number | null {
  for (let i = from + 1; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (!token || !isKnown(token)) return null;
    if (looksLike(token, "noun")) return i;
    if (!looksLike(token, "det", "adj")) return null;
  }
  return null;
}

/**
 * The noun an adjective belongs to: the word immediately before it, and only
 * that. Spanish also agrees predicatively across a copula (`las casas son
 * grandes`), but telling that apart from an unrelated noun needs a parser, and
 * a wrong red word costs more than a missed one — doubt is silence.
 */
function adjectiveHead(tokens: readonly SentenceToken[], from: number): number | null {
  const previous = tokens[from - 1];
  if (!previous || !looksLike(previous, "noun")) return null;
  return from - 1;
}

function exempt(
  rules: LanguageRules,
  modifier: SentenceToken,
  noun: SentenceToken,
): boolean {
  const rule = rules.masculineArticleBeforeFeminine;
  if (!rule) return false;
  if (!rule.determiners.includes(modifier.normalised)) return false;
  return rule.nounPrefixes.some((prefix) => noun.normalised.startsWith(prefix));
}

function agreementFinding(
  tokens: readonly SentenceToken[],
  index: number,
  nounIndex: number,
  table: LemmaTable,
  rules: LanguageRules,
): SentenceFinding | null {
  const modifier = tokens[index];
  const noun = tokens[nounIndex];
  if (!modifier || !noun) return null;
  if (exempt(rules, modifier, noun)) return null;

  const modifierReadings = readings(modifier, MODIFIERS);
  const nounReadings = readings(noun, ["noun"]);
  if (modifierReadings.length === 0 || nounReadings.length === 0) return null;

  let clash: { gender: boolean; number: boolean } | null = null;

  for (const m of modifierReadings) {
    const mf = nominalFeatures(m, table);
    if (!mf) continue;
    for (const n of nounReadings) {
      const nf = nominalFeatures(n, table);
      if (!nf) continue;
      if (featuresAgree(mf, nf)) return null; // one innocent reading clears it
      clash ??= {
        gender: Boolean(mf.gender && nf.gender && mf.gender !== nf.gender),
        number: Boolean(mf.number && nf.number && mf.number !== nf.number),
      };
    }
  }

  if (!clash) return null;

  // The form of this same lemma that would have fitted the noun. Only offered
  // when the noun itself is unambiguous — otherwise "the form that fits" is a
  // question with more than one answer.
  const nounFeatures = nounReadings
    .map((reading) => nominalFeatures(reading, table))
    .filter((features): features is NonNullable<typeof features> => features !== null);
  const first = nounFeatures[0];
  const unambiguous =
    first !== undefined &&
    nounFeatures.every((f) => f.gender === first.gender && f.number === first.number);

  const modifierLemma = modifierReadings[0]?.lemma;
  const suggestion =
    unambiguous && modifierLemma && first.gender && first.number
      ? formFor(table, modifierLemma, `${first.gender}.${first.number}`)
      : undefined;

  // Two keys per clash, not one with an optional placeholder: a message that
  // interpolates a suggestion it does not have renders "«»" at best and throws
  // at worst.
  const feature = clash.gender ? "Gender" : "Number";

  return {
    tokenIndex: index,
    category: "agreement",
    messageKey: suggestion ? `agreement${feature}WithFix` : `agreement${feature}`,
    messageValues: {
      word: modifier.text,
      noun: noun.text,
      ...(suggestion ? { suggestion } : {}),
    },
    ...(suggestion ? { suggestion } : {}),
  };
}

export function agreementFindings(
  tokens: readonly SentenceToken[],
  table: LemmaTable,
  rules: LanguageRules,
): SentenceFinding[] {
  const findings: SentenceFinding[] = [];

  tokens.forEach((token, index) => {
    if (!isKnown(token)) return;
    const modifierReadings = readings(token, MODIFIERS);
    if (modifierReadings.length === 0) return;

    const nounIndex = looksLike(token, "det")
      ? determinerHead(tokens, index)
      : adjectiveHead(tokens, index);
    if (nounIndex === null) return;

    const finding = agreementFinding(tokens, index, nounIndex, table, rules);
    if (finding) findings.push(finding);
  });

  return findings;
}

// --- person -----------------------------------------------------------------

export function personFindings(
  tokens: readonly SentenceToken[],
  table: LemmaTable,
  rules: LanguageRules,
): SentenceFinding[] {
  const findings: SentenceFinding[] = [];

  tokens.forEach((token, index) => {
    const expected = rules.subjectPronouns[token.normalised];
    if (!expected) return;
    // A pronoun that is also something else (Spanish `tu` = "your") cannot
    // carry a subject claim on its own.
    if (token.analyses.some((analysis) => analysis.pos !== "pron")) return;

    const next = tokens[index + 1];
    if (!next) return;
    const verbReadings = readings(next, ["verb"]);
    if (verbReadings.length === 0) return;
    // Only an unambiguous verb: if the word can be a noun too, the sentence may
    // not be pronoun + verb at all.
    if (verbReadings.length !== next.analyses.length) return;

    const persons = verbReadings.map((reading) => verbPerson(reading.cell));
    if (persons.some((person) => person === null || person === expected)) return;

    const cell = verbReadings[0]?.cell;
    const lemma = verbReadings[0]?.lemma;
    const suggestion =
      cell && lemma ? formFor(table, lemma, cell.replace(/[123](?:sg|pl)$/, expected)) : undefined;

    findings.push({
      tokenIndex: index + 1,
      category: "person",
      messageKey: suggestion ? "personMismatchWithFix" : "personMismatch",
      messageValues: {
        pronoun: token.text,
        verb: next.text,
        ...(suggestion ? { suggestion } : {}),
      },
      ...(suggestion ? { suggestion } : {}),
    });
  });

  return findings;
}

// --- target word ------------------------------------------------------------

export function missingTargetFinding(
  tokens: readonly SentenceToken[],
  targetLemma: string | undefined,
  targetWord: string | undefined,
): SentenceFinding | null {
  if (!targetLemma) return null;

  const used = tokens.some(
    (token) =>
      token.normalised === targetLemma ||
      token.analyses.some((analysis) => analysis.lemma === targetLemma),
  );
  if (used) return null;

  return {
    tokenIndex: -1,
    category: "missing-target",
    messageKey: "missingTarget",
    messageValues: { word: targetWord ?? targetLemma },
  };
}
