# Lexicon

<!-- id: SPEC-service-lexicon -->
<!-- use-case: UC-035 -->
<!-- status: draft -->

Everything that is per-language: what counts as a word here, how text splits into
words, which form belongs to which lemma, and how frequent it is. Framework-free.
The foundation the vocabulary estimate and the coverage calculator both stand on.

Background: [`../../studie/18-sprachen-baukasten.md`](../../studie/18-sprachen-baukasten.md).
Data model: [ADR-0004](../../adr/0004-word-task-data-model.md).

## Scope

- **In:** loading and validating a language profile; tokenising text; normalising
  a token; resolving a form to its lemma; frequency rank; deriving the quality
  tier.
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
| 4 | A form, with a lemma table present | Its lemma |
| 5 | A form, with no lemma table | The form itself, and `resolved: "form"` |
| 6 | A lemma or form | Its frequency rank, or none if unlisted |
| 7 | A profile | Quality tier A, B or C, derived from what it contains |

## Runtime is a lookup table, not a model

Morphological analysers (Stanza, UDPipe) are Python and far too large to run in
a browser. They are **build-time** tools: they generate a form → lemma table for
the frequency range we care about, and that table ships.

Consequences, all deliberate:

- Lemma resolution is a dictionary lookup — fast, offline, deterministic, and
  identical on every device.
- An unlisted form resolves to itself, flagged as unresolved. It is never
  guessed at runtime.
- Adding a language means generating a table, not shipping a model.

## The counting unit is not decoration

The vocabulary estimate counts whatever the profile declares. Getting it wrong
does not fail — it produces a plausible number that means nothing, and it is
least visible in the languages where it is most wrong
([`../../studie/18-sprachen-baukasten.md`](../../studie/18-sprachen-baukasten.md) U1).
Hence behavior row 1: a profile without it must not load.

**The shipped frequency data is form frequency, not lemma frequency.** It is
derived from subtitles, so it is also skewed toward spoken register. Spanish
*es*, *son*, *era* and *fue* are four entries for one lemma. Until a lemma table
exists, a lemma rank cannot be derived by reading the list — it requires summing
the forms, which requires the table. This is why Spanish and Italian start at
tier C rather than tier A.

## Data

| Field | Shape | Owner |
| --- | --- | --- |
| `code` | BCP-47-ish string, e.g. `es` | profile |
| `script` | `latin \| cyrillic \| greek \| arabic \| hebrew \| cjk \| devanagari` | profile |
| `morphology` | `isolating \| weak \| fusional \| agglutinative` | profile |
| `countingUnit` | `form \| lemma \| segment` — **required** | profile |
| `frequency` | `{ source, version, entries }`, rank ascending from 1 | data file |
| `lemmaTable` | optional `form → lemma` | data file |
| `calibration` | optional, dated | profile |
| `voices` | optional | profile |

Frequency data provenance is stored with it, not in a comment: source, corpus,
version, licence. A rank without provenance cannot be compared across
recalibrations.

## Quality tier

Derived, never a field someone sets
([`../../studie/18-sprachen-baukasten.md`](../../studie/18-sprachen-baukasten.md)):

| Tier | Requires | Effect |
| --- | --- | --- |
| **C** | frequency list only | Cards and reading work. **No level value** — the skill reads "not measured" |
| **B** | + lemma table | Level with a widened uncertainty band |
| **A** | + dated calibration | Level with normal uncertainty |

## Acceptance criteria

- [ ] AC-1 · Given a profile without `countingUnit`, when it is loaded, then it
      is rejected and the error names that field.
- [ ] AC-2 · Given a profile with an unknown script or morphology value, when it
      is loaded, then it is rejected.
- [ ] AC-3 · Given text in a Latin-script language, when it is tokenised, then
      punctuation and digits are not tokens and each token carries its position.
- [ ] AC-4 · Given the same word in different case or with different surrounding
      punctuation, when normalised, then both produce the same form.
- [ ] AC-5 · Given a form present in the lemma table, when resolved, then its
      lemma is returned and `resolved` is `"lemma"`.
- [ ] AC-6 · Given a form absent from the lemma table, when resolved, then the
      normalised form is returned and `resolved` is `"form"` — never a guess.
- [ ] AC-7 · Given a profile with no lemma table, when its tier is derived, then
      it is `C`; with a lemma table `B`; with a dated calibration too, `A`.
- [ ] AC-8 · When a frequency list is loaded, ranks shall be dense, start at 1,
      and be strictly increasing in the file's order.
- [ ] AC-9 · Given a word not in the frequency list, when its rank is requested,
      then the result is absent — never zero, and never the list length.
- [ ] AC-10 · Given the shipped Spanish and Italian profiles, when loaded, then
      both validate and report tier `C`.

## Check

`npm test -- lexicon`

## Open

- **⚠ SPEC GAP: whether ranks are recomputed when a lemma table arrives.** Summing
  form frequencies into lemma frequencies changes every rank, which is a
  calibration event ([`../../studie/03-level-modell.md`](../../studie/03-level-modell.md)
  rule 4). The migration path for learners who accumulated history at tier C is
  undecided.
- Segmentation for scripts without word boundaries is out of scope here and
  needs its own spec.
