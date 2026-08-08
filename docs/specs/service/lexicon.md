# Lexicon

<!-- id: SPEC-service-lexicon -->
<!-- use-case: UC-035 -->
<!-- status: active -->

Everything that is per-language: what counts as a word here, how text splits into
words, which form belongs to which lemma, **which cell of which paradigm that
form occupies**, and how frequent it is. Framework-free. The foundation the
vocabulary estimate, the coverage calculator and form mastery all stand on.

Background: [`../../study/18-language-kit.md`](../../study/18-language-kit.md),
[`../../study/03-level-model.md`](../../study/03-level-model.md).
Data model: [ADR-0004](../../adr/0004-word-task-data-model.md).

## Scope

- **In:** loading and validating a language profile and a lemma table;
  tokenising text; normalising a token; resolving a form to its analyses —
  lemma, part of speech and paradigm cell; decomposing fused forms; frequency
  rank; deriving the quality tier.
- **Out:** coverage calculation over a text (stage 3), the vocabulary estimate
  and level model (stage 2), scheduling, translation, and **running a
  morphological analyser at runtime**.

The last exclusion is the load-bearing design decision, see below.

## Behavior

| # | Input | Output |
| --- | --- | --- |
| 1 | A profile with no `countingUnit` | Refuses to load, naming the missing field |
| 2 | A text and a profile | Tokens, in order, with positions |
| 3 | A token | Its normalised form (case, accents per profile) |
| 4 | A form with exactly one analysis | `single`, with lemma, part of speech and cell |
| 5 | A form with several analyses | `ambiguous`, all of them, likeliest first |
| 6 | A form that fuses several words (`del`) | `fused`, with the parts |
| 7 | A form the table does not contain | `unknown` — the normalised form, never a guess |
| 8 | A lemma | Its conjugation class or gender, when the table describes it |
| 9 | A lemma or form | Its frequency rank, or none if unlisted |
| 10 | A profile | Quality tier A, B or C, derived from what it contains |

## Runtime is a lookup table, not a model

Morphological analysers (Stanza, UDPipe) are Python and far too large to run in
a browser. They are **build-time** tools: `scripts/build-lemma-tables.mjs`
generates a table over the frequency range we care about, and that table ships.

Consequences, all deliberate:

- Lemma resolution is a dictionary lookup — fast, offline, deterministic, and
  identical on every device.
- An unlisted form resolves to itself, flagged as unknown. It is never guessed at
  runtime, because a runtime guess is a second and worse analyser hiding behind
  the one we moved to build time.
- Adding a language means generating a table, not shipping a model.

## Knowing a lemma is not knowing its forms

The level model needs this and nothing else in the pipeline can supply it: an
Italian learner who produces *parlare* and *parliamo* has not thereby shown
anything about *dormiamo*, because the three conjugation classes diverge, and the
divergence is worst in exactly the frequent verbs
([`../../study/03-level-model.md`](../../study/03-level-model.md), form mastery).

So every mapping carries a **paradigm cell**, in one canonical vocabulary shared
across languages and across source formats — otherwise "produces the 1sg present
but not the 1sg subjunctive" does not mean the same thing twice:

| Part of speech | Cells |
| --- | --- |
| Verb, non-finite | `inf` · `ger` · `part.pres` · `part.past[.m\|f.sg\|pl]` |
| Verb, finite | `ind\|sub` `.pres\|impf\|pret\|fut.` `<person><number>` |
| Verb, other moods | `cond.<person><number>` · `imp.<person><number>` |
| Noun | `sg` · `pl` |
| Adjective | `m.sg` · `f.pl` … , prefixed `comp.` / `sup.` where marked |

A form that is not inflected, or not inflected in a way we model, has cell
`null` — **never an invented cell**. Two properties belong to the *lemma* rather
than to any form, because a learner has to know them separately from the word
itself: a verb's **conjugation class** and a noun's **gender**.

## Ambiguity is reported, not resolved

Spanish `casa` is a noun and three cells of *casar*; Italian `porta` is a noun,
two cells of *portare* and one of *porgere*. Out of context there is no way to
choose, so the lexicon does not: it returns every analysis, likeliest first, and
says that it is ambiguous. A caller that takes the first is taking the best
guess, and the shape of the result makes that visible rather than silent.

**Fused forms are a different thing and are kept apart.** Spanish `del` and
Italian `alla` are not competing readings — both parts are present at once. A
caller that treats them as alternatives counts `del` as a word of its own, and
the vocabulary estimate inflates.

## The counting unit is not decoration

The vocabulary estimate counts whatever the profile declares. Getting it wrong
does not fail — it produces a plausible number that means nothing, and it is
least visible in the languages where it is most wrong
([`../../study/18-language-kit.md`](../../study/18-language-kit.md) U1).
Hence behavior row 1: a profile without it must not load.

**The shipped frequency data is form frequency, not lemma frequency.** It is
derived from subtitles, so it is also skewed toward spoken register. Spanish
*es*, *son*, *era* and *fue* are four entries for one lemma. Summing them into a
lemma rank is now possible — the table exists — but it changes every rank, which
is a calibration event and is still undecided (see Open).

## Data

| Field | Shape | Owner |
| --- | --- | --- |
| `code` | BCP-47-ish string, e.g. `es` | profile |
| `script` | `latin \| cyrillic \| greek \| arabic \| hebrew \| cjk \| devanagari` | profile |
| `morphology` | `isolating \| weak \| fusional \| agglutinative` | profile |
| `countingUnit` | `form \| lemma \| segment` — **required** | profile |
| `frequency` | `{ source, corpus, version, licence, unit, file }` | profile |
| `lemmaTable` | path to the generated table, or `null` | profile |
| `calibration` | optional, dated | profile |
| `voices` | optional | profile |
| `forms` | `form → [[lemma, pos, cell]]`, likeliest first | lemma table |
| `fused` | `form → [lemma, …]` | lemma table |
| `lemmas` | `lemma → { verb: class } \| { noun: gender }` | lemma table |
| `seedCoverage`, `verbParadigmsComplete` | how complete the table is, measured | lemma table |

Provenance is stored with the data, not in a comment: every source, its licence
and its URL. A rank or a lemma without provenance cannot be compared across
recalibrations.

**The table reports its own gaps.** Both paradigm sources are missing frequent
verbs — UniMorph has no Spanish `tener` — so the generator measures what it
produced and records it. A table that hid this would let the level model report
form mastery it cannot actually see.

## Quality tier

Derived, never a field someone sets
([`../../study/18-language-kit.md`](../../study/18-language-kit.md)):

| Tier | Requires | Effect |
| --- | --- | --- |
| **C** | frequency list only | Cards and reading work. **No level value** — the skill reads "not measured" |
| **B** | + lemma table | Level with a widened uncertainty band |
| **A** | + dated calibration | Level with normal uncertainty |

## Acceptance criteria

In [`lexicon.acceptance-criteria.md`](lexicon.acceptance-criteria.md).

## Check

`npm test -- lexicon`

## Open

- **⚠ SPEC GAP: whether ranks are recomputed now that a lemma table exists.**
  Summing form frequencies into lemma frequencies changes every rank, which is a
  calibration event ([`../../study/03-level-model.md`](../../study/03-level-model.md)
  rule 4). The migration path for learners who accumulated history at tier C is
  undecided.
- **⚠ SPEC GAP: what an incomplete paradigm means for form mastery.** A verb
  whose table has 12 of 50 cells is not a verb the learner knows 12 cells of.
  Reporting mastery over a partial paradigm, or excluding such verbs, are both
  defensible; guessing would put an invented rule inside a measurement.
- Missing forms are **not** generated from regular patterns, even where the
  pattern is obvious. A generated form is a model output in a table that claims
  to be a lookup, and it would be wrong for exactly the irregular verbs a learner
  most needs.
- Segmentation for scripts without word boundaries is out of scope here and
  needs its own spec.
