# Sentence check

<!-- id: SPEC-service-sentence-check -->
<!-- use-case: UC-017 -->
<!-- status: active -->

The **conservative checker** for one short learner-written sentence: it marks
what it can *prove* wrong from the lemma table, says why in one line, and stays
silent about everything else. Consumed by the `sentence-check` step component
([`exercise-step-components.md`](exercise-step-components.md)).

Evidence: [`STUDY-006`](../../study/STUDY-006-production.md) — prompts beat
recasts (Lyster & Ranta), and wrong feedback is worse than none.

## Scope

- **In:** tokenising one sentence; per-token verdicts; the closed category list;
  the one-line note per finding; the sentence-level result vocabulary.
- **Out:** word order, word choice, idiom, style, register, tense logic,
  semantics, punctuation — **and any claim that a sentence is correct**; LLM
  correction (still out, [`exercise-runner.md`](../feature/exercise-runner.md));
  storing findings; error trends over time (UC-017 wants them; not this spec).

## The honesty rule

> The checker reports **findings**, never a verdict on the sentence.

A sentence with no findings is `no-findings`, never `correct`. The learner-facing
wording says what was examined: *"Keine Fehler gefunden — geprüft wurden
Rechtschreibung und Übereinstimmung."* This is not politeness. An open
production task has no single right answer; a green tick on a sentence with bad
word order teaches the wrong thing and, per STUDY-006, damages trust in every
other signal the app gives.

Corollary: a finding is emitted **only** when a rule below proves it. Doubt is
silence, not a guess.

## Token verdicts

```ts
type TokenVerdict = "flagged" | "unchecked";
```

Two values, on purpose. There is no `ok` — the checker cannot certify a token,
only fail to fault it. `unchecked` is the default and covers both "examined and
nothing to say" and "not examinable", because the learner-facing difference
between those is nil and a third value would invite an "all-green" claim.

## Categories (closed list)

Adding a category is a spec change, not a code change — UC-017 counts them over
time and invented categories make the trend meaningless.

| id | Proven when | Note shape |
| --- | --- | --- |
| `spelling` | Token is not a known form of the language, and is not a proper noun candidate | Nearest known form within edit distance 1, else "kein bekanntes Wort" |
| `agreement` | Determiner/adjective and its noun carry contradicting gender or number, and no reading of either resolves it | Which feature clashes + the form that fits |
| `person` | An explicit subject pronoun contradicts the person/number of the verb that follows it, under every reading | The form that fits the pronoun |
| `missing-target` | No form of the target lemma appears in the sentence | Names the word that was asked for |

`style`, `word-choice` and `idiom` from UC-017 are deliberately **absent**: they
are not decidable from a lemma table, and STUDY-006 puts style out of reach
below B1 anyway.

## Ambiguity is exculpatory

The lemma table maps a form to **several** analyses (`la` → det `f.sg`; `la` →
pron). A finding requires the clash to hold under **every** combination of
readings. One innocent reading clears the token.

This is what keeps the checker honest on a fusional language, and it is the rule
most likely to be "optimised away" by someone adding a heuristic later. It is
load-bearing: without it the checker flags correct Spanish.

## Result shape

```ts
type SentenceFinding = {
  tokenIndex: number;          // index into tokens; -1 for missing-target
  category: "spelling" | "agreement" | "person" | "missing-target";
  messageKey: string;          // i18n key under `sentenceCheck`
  messageValues?: Record<string, string>;
  suggestion?: string;         // the form that would fit, when one is provable
};

type SentenceTokenSpan = { text: string; start: number; end: number };

type SentenceCheckResult =
  | {
      status: "checked";
      /** Exactly what was checked, unmodified. */
      text: string;
      tokens: SentenceTokenSpan[];
      findings: SentenceFinding[];
    }
  /** Lexicon unavailable for this language — say so, never fake a pass. */
  | { status: "unavailable"; reason: "no-lexicon" | "failed" };
```

**The result carries the text, not a word list.** The checked view rebuilds the
line from `text` and marks the token ranges. Joining the words back together
with spaces silently dropped punctuation and collapsed the learner's own
spacing — `¿Dónde está la casa, mamá?` came back as `Dónde está la casa mamá` —
so the app showed a sentence nobody had written, directly beside a claim about
what was wrong with it. A checker that misquotes makes every mark it draws
suspect.

`status: "unavailable"` is a first-class outcome, not an error to swallow
(Constitution §4). The step renders it as "kann gerade nicht prüfen" and keeps
**Weiter** open — a checker that cannot run must never block a learner.

## Behaviour

| # | Input | Result |
| --- | --- | --- |
| 1 | Empty or whitespace-only text | `checked`, no tokens, no findings — the step gates on its own before calling |
| 2 | Token unknown to the table, capitalised mid-sentence | No `spelling` finding — proper-noun candidate |
| 3 | Token unknown, lowercase | `spelling`; suggestion when exactly one known form is within edit distance 1 |
| 4 | `el casa` | `agreement` on `el` — `casa` is `f.sg` under every reading; suggestion `la` |
| 5 | `la casa` | No finding |
| 6 | `yo tienes` | `person` on `tienes` — suggestion `tengo` |
| 7 | `la mano` (feminine noun in `-o`) | No finding — the table, not the ending, decides |
| 8 | Target lemma absent from every token | `missing-target` with `tokenIndex: -1` |
| 9 | Fused form (`del`, `al`) | Decomposed via the table's `fused` map before analysis |
| 9b | Any input | `text` equals the input exactly; every token's `[start, end)` slices its own `text` out of it |
| 10 | Language has no lemma table | `unavailable` / `no-lexicon` |

## Where it runs

Framework-free in `lib/sentence-check/` (`lib/` is I/O-free by construction), so
the rules are unit-testable without React or a network. The 2.8 MB lemma table
rules out the client bundle, so a **Server Action** loads the table and calls in
— same shape as `buildFormCellExplanation`. Moving the check to the client later
is a data-delivery change only, not a rewrite.

**No web platform substitute exists.** `spellcheck` results are not readable from
JavaScript, and iOS checks against the device's installed keyboard languages
rather than the page language — so a German keyboard silently rewrites Spanish.
The sentence field therefore sets `autocorrect="off"` and `spellcheck="false"`;
the app's own checker is the only correction surface.

## Acceptance criteria

In [`sentence-check.acceptance-criteria.md`](sentence-check.acceptance-criteria.md).

## Check

`npm test -- sentence-check`
